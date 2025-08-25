require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkEmbeddingDimensions() {
  try {
    // Initialize Google Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    console.log('Testing embedding generation...');
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    
    // Test with a sample text
    const result = await model.embedContent('This is a test text to check embedding dimensions');
    
    // Log the embedding dimensions
    const dimensions = result.embedding.values.length;
    console.log(`Embedding dimension: ${dimensions}`);
    console.log('First few values:', result.embedding.values.slice(0, 5));
    
    console.log('\nInstructions:');
    console.log('1. Go to Pinecone Console (https://app.pinecone.io/)');
    console.log('2. Create a new index with:');
    console.log(`   - Name: document-qa-index`);
    console.log(`   - Dimensions: ${dimensions}`);
    console.log('   - Metric: cosine');
    console.log('   - Environment: gcp-starter');
    
  } catch (error) {
    console.error('Error checking embedding dimensions:', error);
  }
}

checkEmbeddingDimensions();
