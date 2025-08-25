import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF, extractTextFromDOCX, splitTextIntoChunks, generateEmbedding } from '@/lib/document-processor';
import { storeDocumentChunks } from '@/lib/pinecone-utils';
import { DocumentProcessorOCR } from '@/lib/document-processor-ocr';

export async function POST(request: NextRequest) {
  try {
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
        error: `Invalid file type: ${file.type}. Supported formats: PDF, DOCX, images and plain text.` 
      }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Extract text based on file type
    let text = '';
    let pageInfo: any = null;
    
    if (file.type === 'application/pdf') {
      console.log(`Processing PDF: ${file.name}`);
      
      // For potentially important documents like certificates, always attempt OCR
      const importantDocTypes = [
        'certificate', 'caste', 'validity', 'id', 'card', 'license', 
        'passport', 'official', 'government', 'document'
      ];
      const isLikelyImportantDocument = importantDocTypes.some(type => 
        file.name.toLowerCase().includes(type.toLowerCase())
      );
      
      // Try standard PDF text extraction first - now returns page info
      pageInfo = await extractTextFromPDF(buffer);
      text = pageInfo.text;
      
      // For certificates and important documents, always apply OCR regardless of text length
      if (isLikelyImportantDocument || !text.trim() || text.length < 500) {
        console.log('PDF might be a scanned document or important certificate. Applying enhanced OCR...');
        try {
          const ocrProcessor = new DocumentProcessorOCR();
          await ocrProcessor.initialize();
          const ocrText = await ocrProcessor.processDocument(buffer, file.type, file.name);
          await ocrProcessor.terminate();
          
          // For important documents, prefer OCR text and add standard text as backup
          if (isLikelyImportantDocument) {
            console.log(`Important document detected (${file.name}). Prioritizing OCR extraction.`);
            if (ocrText && ocrText.trim()) {
              // Add metadata for better AI understanding
              const enhancedText = `
[IMPORTANT DOCUMENT: ${file.name}]
${ocrText}

[ADDITIONAL EXTRACTED TEXT]
${text}
              `;
              text = enhancedText;
              // For OCR-enhanced text, we lose precise page positioning but keep page count
              const enhancedPages = pageInfo.pages.map((page: any, index: number) => ({
                pageNumber: page.pageNumber,
                text: index === 0 ? enhancedText : '', // Only assign text to first page for simplicity
                startPosition: index === 0 ? 0 : 0,
                endPosition: index === 0 ? enhancedText.length : 0
              }));
              pageInfo = { text: enhancedText, pages: enhancedPages };
            }
          } else if (ocrText && ocrText.length > text.length) {
            // For other documents, use the longer extraction
            console.log(`OCR extraction more effective (${ocrText.length} vs ${text.length} chars). Using OCR result.`);
            text = ocrText;
            // For OCR text, we lose precise page positioning
            const ocrPages = pageInfo.pages.map((page: any, index: number) => ({
              pageNumber: page.pageNumber,
              text: index === 0 ? ocrText : '',
              startPosition: index === 0 ? 0 : 0,
              endPosition: index === 0 ? ocrText.length : 0
            }));
            pageInfo = { text: ocrText, pages: ocrPages };
          } else if (ocrText && ocrText.trim()) {
            console.log('Combining standard extraction with OCR for best results');
            text = text + "\n\n" + ocrText;
            // For combined text, we lose precise page positioning
            const combinedPages = pageInfo.pages.map((page: any, index: number) => ({
              pageNumber: page.pageNumber,
              text: index === 0 ? text : '',
              startPosition: index === 0 ? 0 : 0,
              endPosition: index === 0 ? text.length : 0
            }));
            pageInfo = { text: text, pages: combinedPages };
          }
        } catch (ocrError) {
          console.error('OCR processing failed:', ocrError);
        }
      }
    } else if (file.type.startsWith('image/')) {
      // For images, use OCR directly
      try {
        const ocrProcessor = new DocumentProcessorOCR();
        await ocrProcessor.initialize();
        text = await ocrProcessor.processDocument(buffer, file.type, file.name);
        await ocrProcessor.terminate();
      } catch (ocrError) {
        console.error('Image OCR processing failed:', ocrError);
        text = '';
      }
    } else if (file.type === 'text/plain') {
      // For text files, just extract the text directly
      text = buffer.toString('utf-8');
      pageInfo = { text, pages: [{ pageNumber: 1, text: text, startPosition: 0, endPosition: text.length }] };
      console.log(`Extracted ${text.length} characters from text file`);
    } else {
      // For DOCX files
      const docxResult = await extractTextFromDOCX(buffer);
      text = docxResult.text;
      pageInfo = { text: docxResult.text, pages: docxResult.pages };
    }

    if (!text.trim()) {
      return NextResponse.json({ 
        error: 'No text content could be extracted from the document' 
      }, { status: 400 });
    }

    // Split text into chunks with page information
    const chunks = pageInfo ? 
      splitTextIntoChunks(pageInfo.text, file.name, pageInfo.pages) : 
      splitTextIntoChunks(text, file.name);
    
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

    // Store chunks and embeddings in Pinecone
    await storeDocumentChunks(chunks, embeddings);

    return NextResponse.json({
      message: 'Document uploaded and processed successfully',
      filename: file.name,
      chunksCount: chunks.length,
      textLength: text.length
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Provide more specific error messages based on error type
    let errorMessage = 'Failed to process document. Please try again.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('Pinecone')) {
        errorMessage = 'Error connecting to vector database. Please make sure your Pinecone index is set up correctly.';
      } else if (error.message.includes('extract text')) {
        errorMessage = 'Error extracting text from document. The file may be corrupt or in an unsupported format.';
      } else if (error.message.includes('embedding')) {
        errorMessage = 'Error generating embeddings. Please check your Google API key.';
      }
      
      console.error('Detailed error:', error.message);
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: statusCode });
  }
}
