// Script to test Google API key with specific region settings
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get API key from environment
require('dotenv').config({ path: '.env.local' });
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY || GOOGLE_API_KEY === '') {
  console.error('Google API key is missing! Please check your .env.local file.');
  process.exit(1);
}

console.log("Found Google API key:", GOOGLE_API_KEY.substring(0, 5) + '...');

// List of regions to try
const regions = [
  undefined, // Default (us-south1)
  'us-central1',
  'us-east4',
  'us-west1',
  'europe-west4',
  'asia-southeast1'
];

async function testRegion(region) {
  try {
    console.log(`\nTesting region: ${region || 'default (us-south1)'}`);
    
    // Create API client with specific region if provided
    const options = region ? { apiEndpoint: `${region}-aiplatform.googleapis.com` } : {};
    
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Simple test to see if the API key works
    const result = await model.generateContent("Say hello");
    console.log(`✅ Success in region ${region || 'default'}: ${result.response.text()}`);
    return true;
  } catch (error) {
    console.error(`❌ Error in region ${region || 'default'}: ${error.message}`);
    if (error.errorDetails) {
      console.error("Error details:", JSON.stringify(error.errorDetails, null, 2));
    }
    return false;
  }
}

async function testAllRegions() {
  console.log("Testing Google API key in multiple regions...");
  
  let successfulRegion = null;
  
  for (const region of regions) {
    const success = await testRegion(region);
    if (success) {
      successfulRegion = region || 'default';
      break;
    }
    
    // Wait a bit between tests to avoid hitting rate limits even harder
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  if (successfulRegion) {
    console.log(`\n✅ API key works in region: ${successfulRegion}`);
    console.log("\nRecommendation: Update your Google API configuration to use this region.");
  } else {
    console.log("\n❌ API key doesn't work in any tested region.");
    console.log("\nRecommendations:");
    console.log("1. Check your Google Cloud Console quota settings at https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas");
    console.log("2. Request a quota increase at https://cloud.google.com/docs/quotas/help/request_increase");
    console.log("3. Create a new API key with higher quotas from Google AI Studio");
    console.log("4. Consider upgrading from the free tier to a paid tier for higher quotas");
  }
}

testAllRegions();
