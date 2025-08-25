// Direct test for FastChat API
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const FASTCHAT_HOST = process.env.FASTCHAT_HOST || 'http://localhost:8000';
const EMBEDDING_MODEL = process.env.FASTCHAT_EMBEDDING_MODEL || 'all-MiniLM-L6-v2';
const CHAT_MODEL = process.env.FASTCHAT_CHAT_MODEL || 'vicuna-7b-v1.5';

// Test embedding generation
async function testEmbedding() {
  console.log(`Testing embedding generation with model: ${EMBEDDING_MODEL}`);
  
  try {
    const response = await fetch(`${FASTCHAT_HOST}/v1/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: 'This is a test for FastChat embeddings'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Embedding generated successfully!`);
    console.log(`Dimension: ${data.data[0].embedding.length}`);
    console.log(`Sample: ${data.data[0].embedding.slice(0, 3).join(', ')}...`);
    return true;
  } catch (error) {
    console.error('❌ Embedding generation failed:', error);
    return false;
  }
}

// Test chat generation
async function testChatGeneration() {
  console.log(`\nTesting chat completion with model: ${CHAT_MODEL}`);
  
  try {
    const response = await fetch(`${FASTCHAT_HOST}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Say hello and introduce yourself briefly" }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Chat completion successful!`);
    console.log(`Response: "${data.choices[0].message.content.substring(0, 100)}${data.choices[0].message.content.length > 100 ? '...' : ''}"`);
    return true;
  } catch (error) {
    console.error('❌ Chat completion failed:', error);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log(`Testing FastChat at ${FASTCHAT_HOST}...\n`);
  
  const embeddingResult = await testEmbedding();
  const chatResult = await testChatGeneration();
  
  console.log(`\nTest results:`);
  console.log(`- Embedding: ${embeddingResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`- Chat Completion: ${chatResult ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (embeddingResult && chatResult) {
    console.log(`\n🎉 All tests passed! Your FastChat integration is working correctly.`);
    console.log(`You can now set USE_FASTCHAT=true and USE_OLLAMA=false in your .env.local file to use FastChat in your application.`);
  } else {
    console.log(`\n⚠️ Some tests failed. Please check the error messages above.`);
    console.log(`Make sure FastChat is running with all three components:`);
    console.log(`1. Controller: python -m fastchat.serve.controller`);
    console.log(`2. Model Worker: python -m fastchat.serve.model_worker --model-path ./path/to/model`);
    console.log(`3. API Server: python -m fastchat.serve.openai_api_server --host localhost --port 8000`);
  }
}

// Start the tests
runTests().catch(console.error);
