require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');

async function testOpenAIWithEnv() {
  try {
    console.log('🔧 Loading environment variables...');
    
    const apiKey = process.env.OPENAI_API_KEY;
    const useOpenAI = process.env.USE_OPENAI;
    
    console.log(`USE_OPENAI: ${useOpenAI}`);
    console.log(`API Key loaded: ${apiKey ? 'Yes (starts with ' + apiKey.substring(0, 10) + '...)' : 'No'}`);
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.log('❌ OpenAI API key not properly set');
      return;
    }
    
    console.log('🧪 Testing OpenAI API access...');
    
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    // Test embeddings (for document processing)
    console.log('🔍 Testing embeddings...');
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'This is a test for embeddings.',
    });
    
    const embedding = embeddingResponse.data[0].embedding;
    console.log(`✅ Embeddings working! Dimension: ${embedding.length}`);
    
    // Test chat completion (for chatbot responses)
    console.log('💬 Testing chat completion...');
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Respond with exactly: "OpenAI API is working perfectly!"' }
      ],
      max_tokens: 20,
    });
    
    const response = chatResponse.choices[0].message.content;
    console.log(`✅ Chat working! Response: ${response}`);
    
    console.log('🎉 OpenAI API is fully functional!');
    console.log('✅ Your document-qa-chatbot is ready to use with OpenAI!');
    
  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
    
    if (error.message?.includes('Incorrect API key')) {
      console.log('💡 API key issue. Please check:');
      console.log('   1. The key starts with "sk-"');
      console.log('   2. You copied the complete key from OpenAI dashboard');
    } else if (error.message?.includes('quota') || error.message?.includes('billing')) {
      console.log('💡 Usage/billing issue. Please check:');
      console.log('   1. Your OpenAI account has credits: https://platform.openai.com/usage');
      console.log('   2. Add a payment method if needed: https://platform.openai.com/account/billing');
    }
  }
}

testOpenAIWithEnv();
