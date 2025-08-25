// Simple OCR test script that uploads a file directly
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testFileUpload() {
  try {
    console.log('Testing file upload and OCR processing...');
    
    // Path to test document
    const filePath = path.resolve(__dirname, '../data/school leaving.pdf');
    console.log(`Looking for file at: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }
    
    console.log(`File found: ${filePath}`);
    
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    console.log(`File read, size: ${fileBuffer.length} bytes`);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer]), 'school leaving.pdf');
    
    // Make request to upload endpoint
    console.log('Making request to upload endpoint...');
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    
    // Get response
    const result = await response.json();
    console.log('Response received:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run test
testFileUpload();
