// Test script for the chat API
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testChatAPI() {
  console.log('Testing chat API with Ollama integration...');
  
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'What can you tell me about this document?',
        chatHistory: []
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Chat API response:');
    console.log(data);
    
    return true;
  } catch (error) {
    console.error('Chat API test failed:', error);
    return false;
  }
}

// Run the test
testChatAPI().catch(console.error);
