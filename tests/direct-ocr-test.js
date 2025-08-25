/**
 * This script directly tests the OCR functionality on a handwritten document
 * without going through the server.
 */

// Dynamic import for ES modules
async function runTest() {
  try {
    // Import the document processor OCR class
    const { DocumentProcessorOCR } = await import('../lib/document-processor-ocr.js');
    
    // Import file system and path modules
    const fs = require('fs');
    const path = require('path');
    
    console.log('🔍 Starting direct OCR test...');
    
    // Path to the handwritten sample PDF
    const testFile = path.join(__dirname, 'test-files', 'handwritten-sample.pdf');
    
    if (!fs.existsSync(testFile)) {
      console.error(`Test file not found: ${testFile}`);
      return;
    }
    
    console.log(`Testing OCR with file: ${testFile}`);
    
    // Read the file
    const fileBuffer = fs.readFileSync(testFile);
    const mimeType = 'application/pdf';
    
    // Initialize the OCR processor
    console.log('Initializing OCR processor...');
    const processor = new DocumentProcessorOCR();
    await processor.initialize();
    
    // Process the document
    console.log('Processing document with OCR...');
    const text = await processor.processDocument(fileBuffer, mimeType, path.basename(testFile));
    
    // Display the result
    console.log('\nOCR Result:');
    console.log('-----------');
    console.log(text);
    console.log('-----------');
    console.log(`Text length: ${text.length} characters`);
    
    // Cleanup
    await processor.terminate();
    console.log('OCR processor terminated');
    
  } catch (error) {
    console.error('Error running OCR test:', error);
  }
}

runTest().catch(console.error);
