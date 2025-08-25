// Test vLLM API connectivity and functionality
// This script tests both embedding and chat capabilities

const VLLM_HOST = process.env.VLLM_HOST || 'http://localhost:8000';
const VLLM_EMBEDDING_MODEL = process.env.VLLM_EMBEDDING_MODEL || 'BAAI/bge-small-en-v1.5';
const VLLM_CHAT_MODEL = process.env.VLLM_CHAT_MODEL || 'microsoft/DialoGPT-medium';

async function testVLLMEmbedding() {
  try {
    console.log('🧪 Testing vLLM Embedding API...');
    console.log(`🔗 Host: ${VLLM_HOST}`);
    console.log(`📊 Model: ${VLLM_EMBEDDING_MODEL}`);
    
    const response = await fetch(`${VLLM_HOST}/v1/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: VLLM_EMBEDDING_MODEL,
        input: 'This is a test document for embedding generation.',
        encoding_format: 'float',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ vLLM embedding API error: ${response.status} - ${errorText}`);
      return false;
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      console.error('❌ Invalid response format from vLLM embedding API:', data);
      return false;
    }

    const embedding = data.data[0].embedding;
    console.log(`✅ vLLM Embedding API working!`);
    console.log(`📏 Embedding dimension: ${embedding.length}`);
    console.log(`🔢 First 5 values: [${embedding.slice(0, 5).join(', ')}]`);
    
    return true;
  } catch (error) {
    console.error('❌ Error testing vLLM embedding:', error.message);
    return false;
  }
}

async function testVLLMChat() {
  try {
    console.log('\n🧪 Testing vLLM Chat API...');
    console.log(`🔗 Host: ${VLLM_HOST}`);
    console.log(`🤖 Model: ${VLLM_CHAT_MODEL}`);
    
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Answer questions concisely and accurately.'
      },
      {
        role: 'user',
        content: 'Hello! Can you tell me what is machine learning in one sentence?'
      }
    ];

    const response = await fetch(`${VLLM_HOST}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: VLLM_CHAT_MODEL,
        messages: messages,
        max_tokens: 100,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ vLLM chat API error: ${response.status} - ${errorText}`);
      return false;
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid response format from vLLM chat API:', data);
      return false;
    }

    const responseText = data.choices[0].message.content;
    console.log(`✅ vLLM Chat API working!`);
    console.log(`💬 Response: ${responseText}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error testing vLLM chat:', error.message);
    return false;
  }
}

async function testModels() {
  try {
    console.log('🧪 Testing vLLM Models endpoint...');
    
    const response = await fetch(`${VLLM_HOST}/v1/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ vLLM models API error: ${response.status} - ${errorText}`);
      return false;
    }

    const data = await response.json();
    console.log(`✅ vLLM Models API working!`);
    console.log(`🤖 Available models:`, data.data?.map(m => m.id) || []);
    
    return true;
  } catch (error) {
    console.error('❌ Error testing vLLM models:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting vLLM API Tests...\n');
  
  let allPassed = true;
  
  // Test models endpoint first
  const modelsWorking = await testModels();
  allPassed = allPassed && modelsWorking;
  
  // Test embedding API
  const embeddingWorking = await testVLLMEmbedding();
  allPassed = allPassed && embeddingWorking;
  
  // Test chat API
  const chatWorking = await testVLLMChat();
  allPassed = allPassed && chatWorking;
  
  console.log('\n📊 Test Results Summary:');
  console.log(`🤖 Models API: ${modelsWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`📊 Embedding API: ${embeddingWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`💬 Chat API: ${chatWorking ? '✅ Working' : '❌ Failed'}`);
  
  if (allPassed) {
    console.log('\n🎉 All vLLM tests passed! Ready to use vLLM with your application.');
    console.log('💡 To enable vLLM, set USE_VLLM=true in your .env.local file');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your vLLM installation and configuration.');
    console.log('📚 Make sure vLLM is running with the correct models loaded.');
  }
}

// Load environment variables if available
if (typeof require !== 'undefined') {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (e) {
    // dotenv not available, that's fine
  }
}

main().catch(console.error);
