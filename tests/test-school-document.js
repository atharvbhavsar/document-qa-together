// Test script to verify enhanced OCR processing for school documents
const fs = require('fs');
const path = require('path');
const { DocumentProcessorOCR } = require('../lib/document-processor-ocr.ts');

async function testSchoolDocumentOCR() {
  try {
    console.log('Testing enhanced OCR for school documents...');
    
    // Initialize OCR processor
    const ocrProcessor = new DocumentProcessorOCR();
    await ocrProcessor.initialize();
    
    // Define test file paths (you'll need to update these with actual files on your system)
    const testFiles = [
      {
        path: '../data/school leaving.pdf', // Update with actual path
        type: 'application/pdf',
        name: 'school leaving.pdf'
      },
      // Add more test files as needed
    ];
    
    // Test each file
    for (const file of testFiles) {
      try {
        const filePath = path.resolve(__dirname, file.path);
        console.log(`Processing file: ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
          console.log(`File not found: ${filePath}`);
          continue;
        }
        
        // Read file
        const buffer = fs.readFileSync(filePath);
        
        // Process with OCR
        const text = await ocrProcessor.processDocument(buffer, file.type, file.name);
        
        // Display results
        console.log(`Successfully processed ${file.name}`);
        console.log(`Extracted ${text.length} characters`);
        console.log('First 500 characters:');
        console.log(text.substring(0, 500));
        console.log('-'.repeat(80));
      } catch (fileError) {
        console.error(`Error processing ${file.path}:`, fileError);
      }
    }
    
    // Clean up
    await ocrProcessor.terminate();
    console.log('Test completed.');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testSchoolDocumentOCR();
