// Direct test for Ollama API
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text:latest';
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || 'llama3:latest';

// Test embedding generation
async function testEmbedding() {
  console.log(`Testing embedding generation with model: ${EMBEDDING_MODEL}`);
  
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        prompt: 'This is a test for Ollama embeddings'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Embedding generated successfully!`);
    console.log(`Dimension: ${data.embedding.length}`);
    console.log(`Sample: ${data.embedding.slice(0, 3).join(', ')}...`);
    return true;
  } catch (error) {
    console.error('❌ Embedding generation failed:', error);
    return false;
  }
}

// Test text generation
async function testGeneration() {
  console.log(`\nTesting text generation with model: ${CHAT_MODEL}`);
  
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CHAT_MODEL,
        prompt: 'Say hello and introduce yourself briefly',
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Text generation successful!`);
    console.log(`Response: "${data.response.substring(0, 100)}${data.response.length > 100 ? '...' : ''}"`);
    return true;
  } catch (error) {
    console.error('❌ Text generation failed:', error);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log(`Testing Ollama at ${OLLAMA_HOST}...\n`);
  
  const embeddingResult = await testEmbedding();
  const generationResult = await testGeneration();
  
  console.log(`\nTest results:`);
  console.log(`- Embedding: ${embeddingResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`- Generation: ${generationResult ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (embeddingResult && generationResult) {
    console.log(`\n🎉 All tests passed! Your Ollama integration is working correctly.`);
    console.log(`You can now set USE_OLLAMA=true in your .env.local file to use Ollama in your application.`);
  } else {
    console.log(`\n⚠️ Some tests failed. Please check the error messages above.`);
  }
}

// Start the tests
runTests().catch(console.error);
