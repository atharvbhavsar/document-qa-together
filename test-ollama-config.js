// Simple test for Ollama config
require('dotenv').config({ path: '.env.local' });
const { checkOllamaConnection, generateOllamaEmbedding, generateOllamaResponse } = require('./lib/ollama-config');

// Main test function
async function testOllamaConfig() {
  console.log('Testing Ollama configuration...');
  
  // 1. Test connection
  console.log('\nChecking Ollama connection:');
  const isConnected = await checkOllamaConnection();
  console.log(`Ollama connection: ${isConnected ? 'Connected ✅' : 'Failed ❌'}`);
  
  if (!isConnected) {
    console.error('Cannot continue testing - Ollama connection failed');
    return;
  }
  
  // 2. Test embedding
  try {
    console.log('\nTesting embedding generation:');
    const embedding = await generateOllamaEmbedding('This is a test for Ollama embeddings');
    console.log(`Embedding generated successfully ✅`);
    console.log(`Embedding dimension: ${embedding.length}`);
    console.log(`Sample values: ${embedding.slice(0, 3).join(', ')}...`);
  } catch (error) {
    console.error('Embedding generation failed ❌');
    console.error(error);
  }
  
  // 3. Test text generation
  try {
    console.log('\nTesting text generation:');
    const response = await generateOllamaResponse('Say hello and introduce yourself briefly');
    console.log(`Text generation successful ✅`);
    console.log(`Response: "${response.substring(0, 100)}${response.length > 100 ? '...' : ''}"`);
  } catch (error) {
    console.error('Text generation failed ❌');
    console.error(error);
  }
  
  console.log('\nOllama testing complete!');
}

// Run the test
testOllamaConfig().catch(console.error);
