const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGoogleEmbedding() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyDXiiz0PS0CcPCYKYatLMIU6krTcyDKs48');
    
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    
    const result = await model.embedContent('This is a test sentence.');
    const values = result.embedding.values;
    
    console.log('✅ Google Embedding API working!');
    console.log(`Model: text-embedding-004`);
    console.log(`Embedding dimension: ${values.length}`);
    console.log(`Current Pinecone index dimension: 768`);
    
    if (values.length === 768) {
      console.log('✅ Dimensions match perfectly!');
    } else {
      console.log(`❌ Dimension mismatch. Expected 768, got ${values.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing Google embedding:', error.message);
  }
}

testGoogleEmbedding();
