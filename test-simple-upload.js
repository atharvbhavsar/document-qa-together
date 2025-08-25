/**
 * This is a simplified test for our OCR upload API
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

// Test file path
const testFile = path.join(__dirname, 'tests', 'test-files', 'test-text.txt');

// Make sure the test file exists
if (!fs.existsSync(testFile)) {
  console.error(`Test file not found: ${testFile}`);
  process.exit(1);
}

console.log(`Testing with text file: ${testFile}`);

// Create a form data object
const form = new FormData();
form.append('file', fs.createReadStream(testFile), {
  filename: path.basename(testFile),
  contentType: 'text/plain',
});

// Set up the request options
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/upload',
  method: 'POST',
  headers: form.getHeaders()
};

// Send the request
const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Response:', result);
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error(`Error: ${error.message}`);
});

// Send the form data
form.pipe(req);

console.log('Request sent, waiting for response...');
