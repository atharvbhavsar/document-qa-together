/**
 * This script tests the OCR capability with a handwritten text image
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Using dynamic import for fetch (for Node.js compatibility)
async function getFetch() {
  return (await import('node-fetch')).default;
}

async function testHandwrittenOCR() {
  try {
    const fetch = await getFetch();
    
    // Use a handwritten PDF file for testing
    // Note: This should be a PDF file with handwritten or scanned text
    const testFile = path.join(__dirname, 'test-files', 'handwritten-sample.pdf');
    const mimeType = 'application/pdf';
    
    if (!fs.existsSync(testFile)) {
      console.error(`Test file not found: ${testFile}`);
      console.error('Please place a handwritten sample PDF named "handwritten-sample.pdf" in the tests/test-files directory');
      return;
    }
    
    console.log(`Testing OCR with handwritten PDF: ${testFile}`);
    
    // Create form data with the file
    const form = new FormData();
    form.append('file', fs.createReadStream(testFile), {
      filename: path.basename(testFile),
      contentType: mimeType,
    });
    
    // Send the file to the upload API
    console.log('Sending handwritten PDF to the upload API...');
    const apiUrl = 'http://localhost:3001/api/upload';
    console.log(`Using API URL: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: form
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('Upload successful!');
      console.log('API Response:', result);
      
      // Display the full OCR text if available
      if (result.textContent) {
        console.log('\nFull OCR Text:');
        console.log('--------------');
        console.log(result.textContent);
        console.log('--------------');
      }
    } else {
      console.error('Upload failed!');
      console.error('API Error:', result);
    }
    
  } catch (error) {
    console.error('Error testing handwritten OCR upload:', error);
  }
}

// Run the test
testHandwrittenOCR();
