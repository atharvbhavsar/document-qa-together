// Test Together AI API connectivity
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || 'YOUR_TOGETHER_API_KEY';

// Test embedding generation
async function testEmbedding() {
  console.log('🔍 Testing Together AI Embedding...');
  
  try {
    const response = await fetch('https://api.together.xyz/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'BAAI/bge-large-en-v1.5',
        input: 'This is a test sentence for embedding generation.'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Embedding Error:', response.status, errorText);
      return false;
    }

    const data = await response.json();
    console.log('✅ Embedding Success:', {
      dimension: data.data[0].embedding.length,
      model: data.model,
      tokens: data.usage.total_tokens
    });
    return true;
  } catch (error) {
    console.error('❌ Embedding Error:', error.message);
    return false;
  }
}

// Test chat completion
async function testChat() {
  console.log('💬 Testing Together AI Chat...');
  
  try {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [
          {
            role: 'user',
            content: 'Hello! Can you explain what Together AI is?'
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Chat Error:', response.status, errorText);
      return false;
    }

    const data = await response.json();
    console.log('✅ Chat Success:', {
      response: data.choices[0].message.content,
      model: data.model,
      tokens: data.usage.total_tokens
    });
    return true;
  } catch (error) {
    console.error('❌ Chat Error:', error.message);
    return false;
  }
}

// Test available models
async function testModels() {
  console.log('📋 Testing Available Models...');
  
  try {
    const response = await fetch('https://api.together.xyz/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Models Error:', response.status, errorText);
      return false;
    }

    const data = await response.json();
    const embeddingModels = data.data.filter(model => 
      model.id.includes('embed') || model.id.includes('bge') || model.type === 'embedding'
    );
    
    const chatModels = data.data.filter(model => 
      model.id.includes('llama') || model.id.includes('mistral') || model.type === 'language'
    ).slice(0, 5); // Show first 5 chat models

    console.log('✅ Available Embedding Models:', embeddingModels.map(m => m.id));
    console.log('✅ Available Chat Models (sample):', chatModels.map(m => m.id));
    
    return true;
  } catch (error) {
    console.error('❌ Models Error:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Together AI API Tests Starting...');
  console.log('='.repeat(50));
  
  if (!TOGETHER_API_KEY || TOGETHER_API_KEY === 'YOUR_TOGETHER_API_KEY') {
    console.error('❌ Please set TOGETHER_API_KEY in your environment or .env.local file');
    return;
  }

  console.log('🔑 API Key configured:', TOGETHER_API_KEY.substring(0, 10) + '...');
  console.log('');

  const results = {
    models: await testModels(),
    embedding: await testEmbedding(),
    chat: await testChat()
  };

  console.log('');
  console.log('📊 Test Results Summary:');
  console.log('='.repeat(30));
  console.log('Models API:', results.models ? '✅ PASS' : '❌ FAIL');
  console.log('Embedding API:', results.embedding ? '✅ PASS' : '❌ FAIL');
  console.log('Chat API:', results.chat ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('');
  console.log('Overall:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  if (allPassed) {
    console.log('');
    console.log('🎉 Together AI is ready to use! Set USE_TOGETHER=true in your .env.local file.');
  }
}

// Run tests
runTests().catch(console.error);
