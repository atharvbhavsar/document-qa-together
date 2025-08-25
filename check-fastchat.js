// Script to check if FastChat is running and required models are available
require('dotenv').config({ path: '.env.local' });

async function checkFastChat() {
  const FASTCHAT_HOST = process.env.FASTCHAT_HOST || 'http://localhost:8001';
  const EMBEDDING_MODEL = process.env.FASTCHAT_EMBEDDING_MODEL || 'all-MiniLM-L6-v2';
  const CHAT_MODEL = process.env.FASTCHAT_CHAT_MODEL || 'vicuna-7b-v1.5';
  
  console.log(`Checking FastChat server at ${FASTCHAT_HOST}...`);
  
  try {
    // Check server connection
    const serverResponse = await fetch(`${FASTCHAT_HOST}/v1/models`);
    
    if (!serverResponse.ok) {
      console.error('❌ Failed to connect to FastChat server!');
      console.log(`\nMake sure FastChat is running by starting it with the commands:`);
      console.log('1. python -m fastchat.serve.controller');
      console.log('2. python -m fastchat.serve.model_worker --model-path ./path/to/your/model');
      console.log('3. python -m fastchat.serve.openai_api_server --host localhost --port 8000');
      return false;
    }
    
    console.log('✅ Successfully connected to FastChat server!');
    
    // Check available models
    const data = await serverResponse.json();
    const models = data.data || [];
    
    console.log('\nAvailable models:');
    models.forEach(model => {
      console.log(`- ${model.id}`);
    });
    
    // Check if required models are available
    const modelNames = models.map(model => model.id);
    const hasChatModel = modelNames.includes(CHAT_MODEL);
    
    console.log('\nRequired models:');
    console.log(`- ${CHAT_MODEL} (chat): ${hasChatModel ? '✅ Available' : '❌ Not found'}`);
    
    if (!hasChatModel) {
      console.log('\nPlease make sure your chat model is available and started with the model worker:');
      console.log(`python -m fastchat.serve.model_worker --model-path ./path/to/${CHAT_MODEL}`);
      return false;
    }
    
    // Test embedding model - Embeddings usually use a separate endpoint
    console.log('\nTesting embedding generation...');
    try {
      const embeddingResponse = await fetch(`${FASTCHAT_HOST}/v1/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: 'This is a test for embedding'
        })
      });
      
      if (!embeddingResponse.ok) {
        console.error('❌ Failed to test embedding model!');
        const error = await embeddingResponse.text();
        console.error(error);
        return false;
      }
      
      const embeddingData = await embeddingResponse.json();
      console.log(`✅ Embedding generation working. Vector dimension: ${embeddingData.data[0].embedding.length}`);
    } catch (error) {
      console.error('❌ Failed to test embedding generation:', error.message);
      console.log('\nMake sure you have an embedding model worker running:');
      console.log(`python -m fastchat.serve.model_worker --model-path ./path/to/embedding/model --worker-name embedding_worker`);
      return false;
    }
    
    // Test chat model
    console.log('\nTesting chat completion...');
    try {
      const chatResponse = await fetch(`${FASTCHAT_HOST}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: CHAT_MODEL,
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Say hello" }
          ],
          temperature: 0.7
        })
      });
      
      if (!chatResponse.ok) {
        console.error('❌ Failed to test chat model!');
        const error = await chatResponse.text();
        console.error(error);
        return false;
      }
      
      const chatData = await chatResponse.json();
      console.log(`✅ Chat completion working. Response received: "${chatData.choices[0].message.content.substring(0, 50)}..."`);
    } catch (error) {
      console.error('❌ Failed to test chat model:', error.message);
      return false;
    }
    
    console.log('\n🎉 FastChat is fully configured and ready to use!');
    console.log('\nMake sure your .env.local has:');
    console.log('USE_FASTCHAT=true');
    console.log('USE_OLLAMA=false');
    console.log(`FASTCHAT_HOST=${FASTCHAT_HOST}`);
    console.log(`FASTCHAT_EMBEDDING_MODEL=${EMBEDDING_MODEL}`);
    console.log(`FASTCHAT_CHAT_MODEL=${CHAT_MODEL}`);
    
    return true;
  } catch (error) {
    console.error('Error connecting to FastChat:', error);
    console.log('\nMake sure FastChat is running properly with all three components:');
    console.log('1. Controller');
    console.log('2. Model Worker');
    console.log('3. API Server');
    return false;
  }
}

// Run the check
checkFastChat().catch(console.error);
