// Test script for application API endpoints
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testAppAPIEndpoints() {
  console.log('Testing application API endpoints...');
  
  // Determine the application URL
  // NEXT_PUBLIC_APP_URL might be set to 3001, but we know the app is running on 3002
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const actualAppUrl = 'http://localhost:3002';
  
  console.log(`Configured app URL: ${configuredAppUrl}`);
  console.log(`Actual app URL: ${actualAppUrl}`);
  console.log(`API Key: ${process.env.APP_API_KEY ? 'Available' : 'Not available'}`);
  
  try {
    // First, try a simple health check to see if the app is responding
    console.log('\nTesting app server health...');
    try {
      const healthResponse = await fetch(`${actualAppUrl}/api/health`, {
        method: 'GET',
        timeout: 5000 // 5 seconds timeout
      });
      
      if (healthResponse.ok) {
        console.log(`Health check successful: ${healthResponse.status}`);
      } else {
        console.error(`Health check failed with status: ${healthResponse.status}`);
        const errorText = await healthResponse.text();
        console.error(`Error response: ${errorText.substring(0, 200)}`);
      }
    } catch (healthError) {
      console.error('Error during health check:', healthError.message);
    }
    
    // Now test the embeddings endpoint
    console.log('\nTesting application embeddings API...');
    try {
      const embeddingResponse = await fetch(`${actualAppUrl}/api/search/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.APP_API_KEY
        },
        body: JSON.stringify({
          text: 'This is a test document for embeddings'
        }),
        timeout: 5000 // 5 seconds timeout
      });
      
      if (embeddingResponse.ok) {
        const embeddingData = await embeddingResponse.json();
        console.log('Embeddings API Response:');
        console.log(`Status: ${embeddingResponse.status}`);
        if (embeddingData.embedding) {
          console.log(`Embedding dimensions: ${embeddingData.embedding.length}`);
        } else {
          console.error('No embedding in response:', embeddingData);
        }
      } else {
        console.error(`Embeddings API returned status: ${embeddingResponse.status}`);
        const errorText = await embeddingResponse.text();
        console.error(`Error response: ${errorText.substring(0, 200)}`);
      }
    } catch (embeddingError) {
      console.error('Error testing embeddings API:', embeddingError.message);
    }
    
    // Finally test if we can search with FastChat embeddings
    console.log('\nTesting application search API...');
    try {
      const searchResponse = await fetch(`${actualAppUrl}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.APP_API_KEY
        },
        body: JSON.stringify({
          query: 'What are the features of this application?',
          maxResults: 3
        }),
        timeout: 8000 // 8 seconds timeout
      });
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        console.log('Search API Response:');
        console.log(`Status: ${searchResponse.status}`);
        console.log(`Results count: ${searchData.results ? searchData.results.length : 0}`);
      } else {
        console.error(`Search API returned status: ${searchResponse.status}`);
        const errorText = await searchResponse.text();
        console.error(`Error response: ${errorText.substring(0, 200)}`);
      }
    } catch (searchError) {
      console.error('Error testing search API:', searchError.message);
    }
    
    console.log('\nAll tests completed.');
    process.exit(0);
  } catch (error) {
    console.error('Unhandled error during tests:', error);
    process.exit(1);
  }
}

// Run the tests and ensure the script terminates
testAppAPIEndpoints().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
