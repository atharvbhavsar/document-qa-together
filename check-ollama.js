// Script to check if Ollama is running and required models are available
require('dotenv').config({ path: '.env.local' });

async function checkOllama() {
  const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text:latest';
  const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || 'llama3:latest';
  
  console.log(`Checking Ollama server at ${OLLAMA_HOST}...`);
  
  try {
    // Check server connection
    const serverResponse = await fetch(`${OLLAMA_HOST}/api/tags`);
    
    if (!serverResponse.ok) {
      console.error('❌ Failed to connect to Ollama server!');
      console.log(`\nMake sure Ollama is running by starting it with the command:`);
      console.log('ollama serve');
      return false;
    }
    
    console.log('✅ Successfully connected to Ollama server!');
    
    // Check available models
    const data = await serverResponse.json();
    const models = data.models || [];
    
    console.log('\nAvailable models:');
    models.forEach(model => {
      console.log(`- ${model.name}`);
    });
    
    // Check if required models are available
    const modelNames = models.map(model => model.name);
    const hasEmbeddingModel = modelNames.includes(EMBEDDING_MODEL);
    const hasChatModel = modelNames.includes(CHAT_MODEL);
    
    console.log('\nRequired models:');
    console.log(`- ${EMBEDDING_MODEL} (embedding): ${hasEmbeddingModel ? '✅ Available' : '❌ Not found'}`);
    console.log(`- ${CHAT_MODEL} (chat): ${hasChatModel ? '✅ Available' : '❌ Not found'}`);
    
    if (!hasEmbeddingModel || !hasChatModel) {
      console.log('\nPlease pull the missing models with:');
      if (!hasEmbeddingModel) {
        console.log(`ollama pull ${EMBEDDING_MODEL.replace(':latest', '')}`);
      }
      if (!hasChatModel) {
        console.log(`ollama pull ${CHAT_MODEL.replace(':latest', '')}`);
      }
      return false;
    }
    
    // Test embedding model
    console.log('\nTesting embedding model...');
    const embeddingResponse = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        prompt: 'This is a test for embedding'
      })
    });
    
    if (!embeddingResponse.ok) {
      console.error('❌ Failed to test embedding model!');
      const error = await embeddingResponse.text();
      console.error(error);
      return false;
    }
    
    const embeddingData = await embeddingResponse.json();
    console.log(`✅ Embedding model working. Vector dimension: ${embeddingData.embedding.length}`);
    
    // Test chat model
    console.log('\nTesting chat model...');
    try {
      const chatResponse = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: CHAT_MODEL,
          prompt: 'Say hello'
        })
      });
      
      if (!chatResponse.ok) {
        console.error('❌ Failed to test chat model!');
        const error = await chatResponse.text();
        console.error(error);
        return false;
      }
      
      const chatText = await chatResponse.text();
      console.log(`✅ Chat model working. Response received.`);
    } catch (error) {
      console.error('❌ Failed to test chat model:', error.message);
      return false;
    }
    console.log('\n🎉 Ollama is fully configured and ready to use!');
    console.log('\nMake sure your .env.local has:');
    console.log('USE_OLLAMA=true');
    console.log(`OLLAMA_HOST=${OLLAMA_HOST}`);
    console.log(`OLLAMA_EMBEDDING_MODEL=${EMBEDDING_MODEL}`);
    console.log(`OLLAMA_CHAT_MODEL=${CHAT_MODEL}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error checking Ollama:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure Ollama is installed: https://ollama.com/download');
    console.log('2. Start the Ollama server: ollama serve');
    console.log('3. Pull required models:');
    console.log(`   ollama pull ${EMBEDDING_MODEL}`);
    console.log(`   ollama pull ${CHAT_MODEL}`);
    return false;
  }
}

checkOllama();
