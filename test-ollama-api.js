// Test script for Ollama API
const http = require('http');

const fetchOllamaEmbedding = async () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/test/ollama-embedding',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Ollama embedding test result:', result);
          resolve(result);
        } catch (error) {
          console.error('Error parsing response:', error);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error testing Ollama embedding:', error);
      reject(error);
    });
    
    req.end();
  });
};

const fetchOllamaGeneration = async () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/test/ollama-generation',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Ollama generation test result:', result);
          resolve(result);
        } catch (error) {
          console.error('Error parsing response:', error);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error testing Ollama generation:', error);
      reject(error);
    });
    
    req.end();
  });
};

// Run tests
fetchOllamaEmbedding()
  .then(() => fetchOllamaGeneration())
  .catch(console.error);
