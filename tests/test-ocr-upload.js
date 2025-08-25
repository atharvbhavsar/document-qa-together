/**
 * This script tests the OCR capability of the upload API by sending
 * a test image or PDF file for processing.
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Using dynamic import for fetch (for Node.js compatibility)
async function getFetch() {
  return (await import('node-fetch')).default;
}

async function testOCRUpload() {
  try {
    const fetch = await getFetch();
    
    // Use our test text file
    const testFile = path.join(__dirname, 'test-files', 'test-text.txt');
    const mimeType = 'text/plain';
    
    if (!fs.existsSync(testFile)) {
      console.error(`Test file not found: ${testFile}`);
      return;
    }
    
    console.log(`Testing with text file: ${testFile}`);
    
    // Create form data with the file
    const form = new FormData();
    form.append('file', fs.createReadStream(testFile), {
      filename: path.basename(testFile),
      contentType: mimeType,
    });
    
    // Send the file to the upload API (use the test server URL)
    console.log('Sending file to the upload API...');
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
    } else {
      console.error('Upload failed!');
      console.error('API Error:', result);
    }
    
  } catch (error) {
    console.error('Error testing OCR upload:', error);
  }
}

// Run the test
testOCRUpload();
