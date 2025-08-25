const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiPro() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyDXiiz0PS0CcPCYKYatLMIU6krTcyDKs48');
    
    console.log('🧪 Testing Gemini Pro access...');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const result = await model.generateContent('Hello! Can you respond with just "Gemini Pro is working!"?');
    const response = result.response.text();
    
    console.log('✅ Gemini Pro API working!');
    console.log(`Model: gemini-1.5-pro`);
    console.log(`Response: ${response}`);
    
    // Test rate limits
    console.log('\n🔄 Testing rate limits with a second request...');
    const result2 = await model.generateContent('What is 2+2?');
    const response2 = result2.response.text();
    
    console.log('✅ Second request successful!');
    console.log(`Response: ${response2}`);
    console.log('🎉 Gemini Pro is working with good rate limits!');
    
  } catch (error) {
    console.error('❌ Error testing Gemini Pro:', error.message);
    
    if (error.message?.includes('Quota exceeded')) {
      console.log('💡 Your API key might still be on the free tier. Make sure you:');
      console.log('   1. Have a valid payment method on your Google Cloud account');
      console.log('   2. Enabled billing for the Generative AI API');
      console.log('   3. Are using the correct API key from your paid project');
    }
  }
}

testGeminiPro();
