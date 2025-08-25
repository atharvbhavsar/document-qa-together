// Script to test Google API key with embedding model
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get API key from environment
require('dotenv').config({ path: '.env.local' });
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY || GOOGLE_API_KEY === '') {
  console.error('Google API key is missing! Please check your .env.local file.');
  process.exit(1);
}

console.log("Found Google API key:", GOOGLE_API_KEY.substring(0, 5) + '...');

async function testEmbeddingModel() {
  try {
    console.log("Testing embedding model with Google API key...");
    
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    
    // Test the embedding generation
    const result = await model.embedContent("Test embedding generation");
    console.log("✅ Embedding generation successful!");
    console.log("Embedding dimensions:", result.embedding.values.length);
    
    return true;
  } catch (error) {
    console.error("❌ Error with embedding model:", error.message);
    if (error.errorDetails) {
      console.error("Error details:", JSON.stringify(error.errorDetails, null, 2));
    }
    return false;
  }
}

// Test the main chat model too
async function testChatModel() {
  try {
    console.log("\nTesting chat model with Google API key...");
    
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Simple test to see if the API key works
    const result = await model.generateContent("Say hello");
    console.log(`✅ Chat model successful: ${result.response.text()}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error with chat model: ${error.message}`);
    if (error.errorDetails) {
      console.error("Error details:", JSON.stringify(error.errorDetails, null, 2));
    }
    return false;
  }
}

async function runTests() {
  const embeddingSuccess = await testEmbeddingModel();
  const chatSuccess = await testChatModel();
  
  console.log("\n--- Summary ---");
  console.log(`Embedding model: ${embeddingSuccess ? '✅ Working' : '❌ Not working'}`);
  console.log(`Chat model: ${chatSuccess ? '✅ Working' : '❌ Not working'}`);
  
  if (!embeddingSuccess || !chatSuccess) {
    console.log("\nRecommendations:");
    console.log("1. Verify your API key is correct and not expired");
    console.log("2. Check that your Google Cloud project has enabled the Gemini API");
    console.log("3. Check your quota limits in Google Cloud Console");
    console.log("4. Create a new API key with the necessary permissions");
  }
}

runTests();
