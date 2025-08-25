// Simplified test script for FastChat API only
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testFastChatAPI() {
  console.log('Testing FastChat API directly...');
  console.log('Environment variables:');
  console.log(`USE_FASTCHAT: ${process.env.USE_FASTCHAT}`);
  console.log(`FASTCHAT_HOST: ${process.env.FASTCHAT_HOST}`);
  console.log(`FASTCHAT_EMBEDDING_MODEL: ${process.env.FASTCHAT_EMBEDDING_MODEL}`);
  
  try {
    // Test embeddings with the FastChat API directly (not through our app)
    const embeddingUrl = `${process.env.FASTCHAT_HOST}/v1/embeddings`;
    console.log(`Sending request to: ${embeddingUrl}`);
    
    const embeddingResponse = await fetch(embeddingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.FASTCHAT_EMBEDDING_MODEL,
        input: 'This is a test document to embed'
      })
    });

    const embeddingData = await embeddingResponse.json();
    console.log('FastChat Embedding API Response:');
    console.log(`Status: ${embeddingResponse.status}`);
    console.log(`Model used: ${embeddingData.model}`);
    console.log(`Vector dimensions: ${embeddingData.data[0].embedding.length}`);
    
    console.log('\nTest completed successfully!');
    process.exit(0); // Explicitly exit the script
  } catch (error) {
    console.error('Error testing FastChat API:', error);
    process.exit(1); // Exit with error code
  }
}

// Run the test and make sure it terminates
testFastChatAPI().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
