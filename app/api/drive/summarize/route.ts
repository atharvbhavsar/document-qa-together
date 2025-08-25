import { NextRequest, NextResponse } from 'next/server';
import GoogleDriveService from '@/lib/google-drive';
import { DocumentProcessorOCR } from '@/lib/document-processor-ocr';

export async function POST(request: NextRequest) {
  const documentProcessor = new DocumentProcessorOCR();
  
  try {
    await documentProcessor.initialize();
    
    const body = await request.json();
    const { fileId, tokens } = body;

    if (!tokens) {
      return NextResponse.json(
        { error: 'Google Drive authentication tokens required' },
        { status: 401 }
      );
    }

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Create Drive service instance and set credentials
    const driveService = new GoogleDriveService();
    driveService.setTokens(tokens);
    
    // Get file content and metadata
    const [fileContent, fileMetadata] = await Promise.all([
      driveService.getFileContent(fileId),
      driveService.getFileMetadata(fileId)
    ]);

    if (!fileMetadata) {
      return NextResponse.json(
        { error: 'Could not retrieve file metadata' },
        { status: 404 }
      );
    }

    // Process the document to extract text
    const textContent = await documentProcessor.processDocument(
      Buffer.from(fileContent),
      fileMetadata.mimeType,
      fileMetadata.name
    );
    
    // Generate summary using Ollama model
    const { generateOllamaResponse } = await import('@/lib/ollama-config');
    
    const prompt = `
You are a document summarization assistant. Your task is to create a comprehensive and concise summary of the document below.

Document: ${fileMetadata.name}
Type: ${fileMetadata.mimeType}

Content:
${textContent.slice(0, 8000)} // Limit content length to avoid token issues

Please provide a summary that captures:
1. The main topic and purpose of the document
2. Key points, facts, or findings
3. Any important conclusions or recommendations
4. Structure the summary in bullet points for readability

SUMMARY:
`;

    const summary = await generateOllamaResponse(prompt);

    return NextResponse.json({ 
      success: true, 
      summary,
      fileName: fileMetadata.name
    });

  } catch (error: any) {
    console.error('Error summarizing document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to summarize document' },
      { status: 500 }
    );
  } finally {
    // Make sure to clean up
    try {
      await documentProcessor.cleanup();
    } catch (err) {
      console.error('Error cleaning up document processor:', err);
    }
  }
}
