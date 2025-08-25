// Simple script to check if the Google API key is valid
import { genAI } from './lib/config';

async function checkAPIKey() {
  try {
    console.log("Testing Google API key...");
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Simple test to see if the API key works
    const result = await model.generateContent("Say hello");
    console.log("API key is valid! Response:", result.response.text());
  } catch (error) {
    console.error("Error with Google API key:", error);
  }
}

checkAPIKey();
