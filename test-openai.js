const OpenAI = require('openai');

async function testOpenAI() {
  try {
    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.log('❌ Please update your OpenAI API key in .env.local');
      console.log('   Change: OPENAI_API_KEY=your_openai_api_key_here');
      console.log('   To:     OPENAI_API_KEY=sk-your-actual-key-here');
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
        { role: 'user', content: 'Say "OpenAI is working!" if you can read this.' }
      ],
      max_tokens: 20,
    });
    
    const response = chatResponse.choices[0].message.content;
    console.log(`✅ Chat working! Response: ${response}`);
    
    console.log('🎉 OpenAI API is fully functional!');
    console.log('✅ Your document-qa-chatbot is ready to use!');
    
  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
    
    if (error.message?.includes('Incorrect API key')) {
      console.log('💡 Your API key seems incorrect. Please check:');
      console.log('   1. The key starts with "sk-"');
      console.log('   2. You copied the complete key');
      console.log('   3. The key is from https://platform.openai.com/api-keys');
    } else if (error.message?.includes('quota')) {
      console.log('💡 You may have exceeded your free credits. Check your usage at:');
      console.log('   https://platform.openai.com/usage');
    }
  }
}

testOpenAI();
