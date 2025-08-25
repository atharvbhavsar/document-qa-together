import { NextRequest, NextResponse } from 'next/server';
import { splitTextIntoChunks, generateEmbedding } from '@/lib/document-processor';
import { storeDocumentChunks } from '@/lib/pinecone-utils';
import { DocumentProcessorOCR } from '@/lib/document-processor-ocr';

export async function POST(request: NextRequest) {
  const processor = new DocumentProcessorOCR();
  
  try {
    // Initialize OCR processor
    await processor.initialize();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/tiff',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type: ${file.type}. Supported formats: PDF, DOCX, and images (JPEG, PNG, GIF, WebP, TIFF).` 
      }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Process the document with OCR
    console.log(`Processing ${file.name} with OCR...`);
    const text = await processor.processDocument(buffer, file.type, file.name);

    if (!text.trim()) {
      return NextResponse.json({ 
        error: 'No text content could be extracted from the document' 
      }, { status: 400 });
    }

    console.log(`Successfully extracted ${text.length} characters of text`);

    // Split text into chunks
    const chunks = splitTextIntoChunks(text, file.name);
    
    if (chunks.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to create text chunks from document' 
      }, { status: 400 });
    }

    // Generate embeddings for each chunk
    const embeddings: number[][] = [];
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.text);
      embeddings.push(embedding);
    }

    // Store chunks in database
    await storeDocumentChunks(chunks, embeddings);
    
    return NextResponse.json({ 
      success: true, 
      message: `Document processed successfully. Created ${chunks.length} chunks.`,
      filename: file.name,
      textLength: text.length,
      chunks: chunks.length
    });
  } catch (error: any) {
    console.error('Error processing document with OCR:', error);
    return NextResponse.json({ 
      error: `Error processing document: ${error.message || 'Unknown error'}` 
    }, { status: 500 });
  } finally {
    // Always terminate the OCR processor
    await processor.terminate();
  }
}
