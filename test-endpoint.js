// Script to test the Ollama endpoint
const fetch = require('node-fetch');

async function testOllamaEndpoint() {
  try {
    console.log('Testing Ollama embedding endpoint...');
    const response = await fetch('http://localhost:3001/api/test/ollama-embedding');
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing endpoint:', error);
  }
}

testOllamaEndpoint();
