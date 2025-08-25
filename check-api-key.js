// Simple script to check if the Google API key is valid
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get API key from environment
require('dotenv').config({ path: '.env.local' });
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY || GOOGLE_API_KEY === '') {
  console.error('Google API key is missing! Please check your .env.local file.');
  process.exit(1);
}

console.log("Found Google API key:", GOOGLE_API_KEY.substring(0, 5) + '...');

async function checkAPIKey() {
  try {
    console.log("Testing Google API key...");
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Simple test to see if the API key works
    const result = await model.generateContent("Say hello");
    console.log("API key is valid! Response:", result.response.text());
  } catch (error) {
    console.error("Error with Google API key:", error);
  }
}

checkAPIKey();
