// Simple test script to verify FastChat integration
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testFastChatWithApp() {
  console.log('Testing FastChat integration with application...');
  console.log(`FASTCHAT_HOST: ${process.env.FASTCHAT_HOST}`);
  console.log(`FASTCHAT_EMBEDDING_MODEL: ${process.env.FASTCHAT_EMBEDDING_MODEL}`);
  console.log(`APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
  
  try {
    // Send a search query through the application API
    console.log('\nTesting search API with FastChat...');
    const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.APP_API_KEY
      },
      body: JSON.stringify({
        query: 'What is SQL?',
        maxResults: 3
      }),
      timeout: 10000 // 10 seconds timeout
    });
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('Search API Response:');
      console.log(`Status: ${searchResponse.status}`);
      console.log(`Results count: ${searchData.results ? searchData.results.length : 0}`);
      
      if (searchData.results && searchData.results.length > 0) {
        console.log('\nSample result:');
        console.log(`Text: ${searchData.results[0].text.substring(0, 200)}...`);
        console.log(`Score: ${searchData.results[0].score}`);
      }
      
      console.log('\nFastChat integration test successful!');
    } else {
      console.error(`Search API returned status: ${searchResponse.status}`);
      const errorText = await searchResponse.text();
      console.error(`Error response: ${errorText.substring(0, 200)}`);
    }
  } catch (error) {
    console.error('Error testing FastChat integration:', error.message);
  }
  
  // Always exit to avoid hanging
  process.exit(0);
}

// Run the test
testFastChatWithApp().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
