/**
 * Simple OCR test for certificates
 */
const fs = require('fs');
const path = require('path');
const { createWorker } = require('tesseract.js');
const pdfParse = require('pdf-parse');

async function testOCR() {
  try {
    // Path to data directory
    const dataDir = path.resolve(__dirname, '..', '..', 'internal-docs-qa', 'data');
    console.log('Looking for certificate files in:', dataDir);
    
    if (!fs.existsSync(dataDir)) {
      console.error('Data directory not found:', dataDir);
      return;
    }
    
    // List files
    const files = fs.readdirSync(dataDir);
    console.log('All files in data directory:', files);
    
    // Find certificate files
    const certificateFiles = files.filter(file => {
      const lowerName = file.toLowerCase();
      return (
        (lowerName.includes('certificate') || 
        lowerName.includes('caste') || 
        lowerName.includes('validity')) &&
        lowerName.endsWith('.pdf')
      );
    });
    
    if (certificateFiles.length === 0) {
      console.log('No certificate PDF files found. Using school leaving.pdf instead.');
      // Try to use a known file
      if (files.includes('school leaving.pdf')) {
        certificateFiles.push('school leaving.pdf');
      } else {
        // Use the first PDF file we find
        const firstPdf = files.find(f => f.toLowerCase().endsWith('.pdf'));
        if (firstPdf) {
          certificateFiles.push(firstPdf);
        } else {
          console.error('No PDF files found for testing');
          return;
        }
      }
    }
    
    console.log('Testing with file:', certificateFiles[0]);
    const testFile = path.join(dataDir, certificateFiles[0]);
    
    // Read the file
    const fileBuffer = fs.readFileSync(testFile);
    
    // Basic PDF extraction first
    console.log('Extracting text with pdf-parse...');
    try {
      const pdfData = await pdfParse(fileBuffer);
      console.log('\n===== PDF-PARSE TEXT =====\n');
      console.log(pdfData.text);
      console.log('\n===== END PDF-PARSE TEXT =====\n');
      console.log(`Extracted ${pdfData.text.length} characters with pdf-parse`);
    } catch (error) {
      console.error('Error with pdf-parse:', error);
    }
    
    // Now try OCR with Tesseract
    console.log('Initializing Tesseract...');
    const worker = await createWorker('eng');
    
    try {
      console.log('Recognizing text...');
      const { data } = await worker.recognize(fileBuffer);
      
      console.log('\n===== TESSERACT OCR TEXT =====\n');
      console.log(data.text);
      console.log('\n===== END TESSERACT OCR TEXT =====\n');
      console.log(`Extracted ${data.text.length} characters with Tesseract OCR`);
    } catch (error) {
      console.error('Error with Tesseract OCR:', error);
    } finally {
      await worker.terminate();
    }
    
    console.log('Test completed');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testOCR().catch(console.error);
