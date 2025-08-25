import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export interface ExportMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sources?: string[];
}

export interface ExportOptions {
  format: 'pdf' | 'word' | 'email';
  includeTimestamps?: boolean;
  includeSources?: boolean;
  title?: string;
}

export class ChatExporter {
  static async exportToPDF(messages: ExportMessage[], options: ExportOptions = { format: 'pdf' }): Promise<Blob> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let currentY = 30;

    // Title
    const title = options.title || 'Chat History Export';
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, currentY);
    currentY += 20;

    // Export date
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Exported on: ${new Date().toLocaleString()}`, margin, currentY);
    currentY += 15;

    // Messages
    pdf.setFontSize(12);
    
    for (const message of messages) {
      // Check if we need a new page
      if (currentY > pageHeight - 40) {
        pdf.addPage();
        currentY = 30;
      }

      // Message header
      const role = message.isUser ? 'User' : 'Assistant';
      const timestamp = options.includeTimestamps ? 
        ` - ${message.timestamp.toLocaleString()}` : '';
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${role}${timestamp}:`, margin, currentY);
      currentY += 8;

      // Message content
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(message.text, maxWidth);
      
      for (const line of lines) {
        if (currentY > pageHeight - 20) {
          pdf.addPage();
          currentY = 30;
        }
        pdf.text(line, margin, currentY);
        currentY += 6;
      }

      // Sources
      if (options.includeSources && message.sources && message.sources.length > 0) {
        currentY += 5;
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(10);
        pdf.text(`Sources: ${message.sources.join(', ')}`, margin, currentY);
        pdf.setFontSize(12);
        currentY += 8;
      }

      currentY += 10; // Space between messages
    }

    return pdf.output('blob');
  }

  static async exportToWord(messages: ExportMessage[], options: ExportOptions = { format: 'word' }): Promise<Blob> {
    const title = options.title || 'Chat History Export';
    
    const children: Paragraph[] = [];

    // Title
    children.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.TITLE,
        spacing: { after: 300 }
      })
    );

    // Export date
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Exported on: ${new Date().toLocaleString()}`,
            italics: true,
            size: 20
          })
        ],
        spacing: { after: 400 }
      })
    );

    // Messages
    for (const message of messages) {
      const role = message.isUser ? 'User' : 'Assistant';
      const timestamp = options.includeTimestamps ? 
        ` - ${message.timestamp.toLocaleString()}` : '';

      // Message header
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${role}${timestamp}:`,
              bold: true,
              size: 24
            })
          ],
          spacing: { before: 200, after: 100 }
        })
      );

      // Message content
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: message.text,
              size: 22
            })
          ],
          spacing: { after: 150 }
        })
      );

      // Sources
      if (options.includeSources && message.sources && message.sources.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Sources: ${message.sources.join(', ')}`,
                italics: true,
                size: 20,
                color: '666666'
              })
            ],
            spacing: { after: 200 }
          })
        );
      }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    return new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
  }

  static generateEmailContent(messages: ExportMessage[], options: ExportOptions = { format: 'email' }): string {
    const title = options.title || 'Chat History Export';
    let content = `${title}\n`;
    content += '='.repeat(title.length) + '\n\n';
    content += `Exported on: ${new Date().toLocaleString()}\n\n`;

    for (const message of messages) {
      const role = message.isUser ? 'User' : 'Assistant';
      const timestamp = options.includeTimestamps ? 
        ` - ${message.timestamp.toLocaleString()}` : '';
      
      content += `${role}${timestamp}:\n`;
      content += message.text + '\n';

      if (options.includeSources && message.sources && message.sources.length > 0) {
        content += `Sources: ${message.sources.join(', ')}\n`;
      }
      
      content += '\n' + '-'.repeat(50) + '\n\n';
    }

    return content;
  }

  static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async copyToClipboard(content: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}

export default ChatExporter;
