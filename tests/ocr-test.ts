import { DocumentProcessorOCR } from '../lib/document-processor-ocr';
import fs from 'fs/promises';
import path from 'path';

async function checkIfFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findTestPdf(): Promise<string | null> {
  // Try different paths to find a PDF
  const possiblePaths = [
    path.join(process.cwd(), 'tests', 'test-files', 'handwritten-sample.pdf'),
    path.join(process.cwd(), '..', 'internal-docs-qa', 'data', 'DM Unit 2 Mahesh Shinde.pdf'),
    path.join(process.cwd(), '..', 'internal-docs-qa', 'data', '10 th.pdf'),
    path.join(process.cwd(), '..', 'internal-docs-qa', 'data', '12th.pdf'),
    // Add any other PDFs you know exist in the data folder
  ];
  
  for (const pdfPath of possiblePaths) {
    if (await checkIfFileExists(pdfPath)) {
      console.log(`Found PDF at: ${pdfPath}`);
      return pdfPath;
    }
  }
  
  return null;
}

async function testOCR() {
  console.log('🚀 Starting OCR test...');
  console.log(`Current working directory: ${process.cwd()}`);
  
  // Initialize with a timeout to prevent hanging
  console.log('Initializing OCR processor...');
  const processor = new DocumentProcessorOCR();
  
  try {
    // Set a timeout to prevent hanging
    const initializePromise = processor.initialize();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Initialize timeout after 30 seconds')), 30000);
    });
    
    await Promise.race([initializePromise, timeoutPromise]);
    console.log('✅ OCR processor initialized successfully');
    
    // Find a test PDF
    const pdfPath = await findTestPdf();
    if (!pdfPath) {
      throw new Error('Could not find any test PDF file');
    }
    
    console.log(`📄 Reading PDF from: ${pdfPath}`);
    const pdfBuffer = await fs.readFile(pdfPath);
    console.log(`📄 PDF loaded, size: ${pdfBuffer.length} bytes`);
    
    // Process with timeout
    console.log('Processing PDF...');
    const processPromise = processor.processDocument(
      pdfBuffer,
      'application/pdf',
      path.basename(pdfPath)
    );
    
    const processTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Processing timeout after 60 seconds')), 60000);
    });
    
    const text = await Promise.race([processPromise, processTimeoutPromise]) as string;

    console.log('✅ Processing complete!');
    console.log(`Extracted text length: ${text.length} characters`);
    
    if (text.length > 0) {
      console.log('\nExtracted text preview:');
      console.log('----------------------');
      console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
      console.log('----------------------');
    } else {
      console.log('No text was extracted from the document.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    try {
      console.log('Terminating OCR processor...');
      await processor.terminate();
      console.log('✅ OCR processor terminated');
    } catch (error) {
      console.error('Error terminating OCR processor:', error);
    }
  }
}

testOCR().catch(console.error);
