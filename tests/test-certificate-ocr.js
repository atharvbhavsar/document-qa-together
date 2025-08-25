/**
 * This script tests OCR functionality specifically for certificates and important documents
 */

const fs = require('fs');
const path = require('path');

async function testCertificateOCR() {
  try {
    // Import the document processor OCR class using CommonJS
    const { DocumentProcessorOCR } = require('../lib/document-processor-ocr');
    
    // Path to a certificate PDF file
    // Look for files that might be certificates in the data directory
    const dataDir = path.resolve('..', 'internal-docs-qa', 'data');
    console.log('Looking for certificate files in:', dataDir);
    
    const files = fs.readdirSync(dataDir);
    const certificateFiles = files.filter(file => {
      const lowerName = file.toLowerCase();
      return (
        lowerName.includes('certificate') ||
        lowerName.includes('caste') ||
        lowerName.includes('valid')
      ) && (lowerName.endsWith('.pdf') || lowerName.endsWith('.jpg') || lowerName.endsWith('.png'));
    });
    
    if (certificateFiles.length === 0) {
      console.log('No certificate files found. Please upload a certificate file to the data directory.');
      return;
    }
    
    console.log('Found certificate files:', certificateFiles);
    
    // Test with first certificate file
    const testFile = path.join(dataDir, certificateFiles[0]);
    console.log('Testing OCR with file:', testFile);
    
    // Read the file
    const fileBuffer = fs.readFileSync(testFile);
    
    // Determine file type
    let mimeType = 'application/pdf';
    if (testFile.toLowerCase().endsWith('.jpg') || testFile.toLowerCase().endsWith('.jpeg')) {
      mimeType = 'image/jpeg';
    } else if (testFile.toLowerCase().endsWith('.png')) {
      mimeType = 'image/png';
    }
    
    // Initialize OCR processor
    const ocrProcessor = new DocumentProcessorOCR();
    await ocrProcessor.initialize();
    
    console.log('OCR processor initialized. Processing document...');
    
    // Process the document
    const extractedText = await ocrProcessor.processDocument(
      fileBuffer,
      mimeType,
      path.basename(testFile)
    );
    
    // Cleanup
    await ocrProcessor.terminate();
    
    // Display results
    console.log('\n===== EXTRACTED TEXT =====\n');
    console.log(extractedText);
    console.log('\n=========================\n');
    console.log(`Total characters extracted: ${extractedText.length}`);
    
    // Basic analysis of the text
    const lines = extractedText.split('\n').filter(line => line.trim().length > 0);
    console.log(`Total lines: ${lines.length}`);
    
    // Look for common certificate fields
    const possibleNameLines = lines.filter(line => 
      line.toLowerCase().includes('name') || 
      line.match(/^\s*[A-Z][a-z]+ [A-Z][a-z]+\s*$/)
    );
    
    const possibleDateLines = lines.filter(line => 
      line.toLowerCase().includes('date') || 
      line.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/) || 
      line.match(/\d{1,2} [A-Za-z]+ \d{2,4}/)
    );
    
    const possibleIDLines = lines.filter(line => 
      line.toLowerCase().includes('certificate') && line.match(/\d+/) ||
      line.toLowerCase().includes('number') ||
      line.toLowerCase().includes('id')
    );
    
    console.log('\n===== POTENTIAL CERTIFICATE INFO =====');
    if (possibleNameLines.length > 0) {
      console.log('\nPossible Name Lines:');
      possibleNameLines.forEach(line => console.log('- ' + line.trim()));
    }
    
    if (possibleDateLines.length > 0) {
      console.log('\nPossible Date Lines:');
      possibleDateLines.forEach(line => console.log('- ' + line.trim()));
    }
    
    if (possibleIDLines.length > 0) {
      console.log('\nPossible ID/Certificate Number Lines:');
      possibleIDLines.forEach(line => console.log('- ' + line.trim()));
    }
    
    console.log('\n=====================================\n');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testCertificateOCR().catch(console.error);
