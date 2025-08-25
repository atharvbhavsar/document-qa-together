import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { ChatExporter } from '@/lib/export-utils';

interface EmailRequest {
  to: string;
  subject: string;
  messages: Array<{
    id: string;
    text: string;
    isUser: boolean;
    timestamp: string;
    sources?: string[];
  }>;
  options?: {
    includeTimestamps?: boolean;
    includeSources?: boolean;
    title?: string;
  };
  attachFormat?: 'pdf' | 'word' | 'both';
}

export async function POST(request: NextRequest) {
  try {
    const { to, subject, messages, options = {}, attachFormat }: EmailRequest = await request.json();

    if (!to || !subject || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, or messages' },
        { status: 400 }
      );
    }

    // Convert message timestamps from string to Date
    const processedMessages = messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Generate email content
    const exportOptions = {
      format: 'email' as const,
      includeTimestamps: options.includeTimestamps ?? true,
      includeSources: options.includeSources ?? true,
      title: options.title || 'Chat History Export'
    };

    const emailContent = ChatExporter.generateEmailContent(processedMessages, exportOptions);

    // Prepare attachments
    const attachments: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }> = [];

    if (attachFormat === 'pdf' || attachFormat === 'both') {
      try {
        const pdfBlob = await ChatExporter.exportToPDF(processedMessages, { ...exportOptions, format: 'pdf' });
        const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());
        attachments.push({
          filename: `chat-history-${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        });
      } catch (error) {
        console.error('Failed to generate PDF attachment:', error);
      }
    }

    if (attachFormat === 'word' || attachFormat === 'both') {
      try {
        const wordBlob = await ChatExporter.exportToWord(processedMessages, { ...exportOptions, format: 'word' });
        const wordBuffer = Buffer.from(await wordBlob.arrayBuffer());
        attachments.push({
          filename: `chat-history-${new Date().toISOString().split('T')[0]}.docx`,
          content: wordBuffer,
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
      } catch (error) {
        console.error('Failed to generate Word attachment:', error);
      }
    }

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: emailContent,
      attachments: attachments.length > 0 ? attachments : undefined
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      attachmentCount: attachments.length
    });

  } catch (error) {
    console.error('Email sending failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('authentication') || error.message.includes('auth')) {
        return NextResponse.json(
          { error: 'Email authentication failed. Please check your email configuration.' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}

// GET endpoint to check email configuration
export async function GET() {
  const hasEmailConfig = !!(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD);
  
  return NextResponse.json({
    configured: hasEmailConfig,
    service: hasEmailConfig ? 'Gmail' : 'Not configured'
  });
}
