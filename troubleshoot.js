require('dotenv').config({ path: '.env.local' });
const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Main troubleshooting function
async function troubleshootSetup() {
  console.log('===== DOCUMENT Q&A CHATBOT TROUBLESHOOTING =====\n');
  
  // Check environment variables
  checkEnvironmentVariables();
  
  // Check Google Gemini API
  await checkGeminiApi();
  
  // Check Pinecone setup
  await checkPineconeSetup();
  
  console.log('\n===== TROUBLESHOOTING COMPLETED =====');
}

// Check environment variables
function checkEnvironmentVariables() {
  console.log('Checking environment variables...');
  
  const requiredVars = [
    'GOOGLE_API_KEY',
    'PINECONE_API_KEY',
    'PINECONE_INDEX_NAME'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      console.error(`❌ ${varName} is missing from your .env.local file`);
      allPresent = false;
    } else {
      console.log(`✅ ${varName} is set`);
    }
  });
  
  if (allPresent) {
    console.log('✅ All required environment variables are set');
  }
  
  console.log('');
}

// Check Google Gemini API
async function checkGeminiApi() {
  console.log('Checking Google Gemini API...');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Check embedding model
    console.log('Testing embedding model (text-embedding-004)...');
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const embeddingResult = await embeddingModel.embedContent('This is a test');
    const dimensions = embeddingResult.embedding.values.length;
    
    console.log(`✅ Embedding model working - generated ${dimensions} dimensions`);
    console.log(`ℹ️ Remember this number: ${dimensions} - your Pinecone index must have the same dimensions!`);
    
    // Check chat model
    console.log('Testing chat model (gemini-1.5-flash)...');
    const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const chatResult = await chatModel.generateContent('Say hello world');
    const response = await chatResult.response;
    const text = response.text();
    
    console.log(`✅ Chat model working - response: "${text.substring(0, 50)}..."`);
    
  } catch (error) {
    console.error('❌ Error with Google Gemini API:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Check if your API key is correct in .env.local');
    console.log('2. Ensure you have access to the Gemini API');
    console.log('3. Check if your model names are correct (text-embedding-004, gemini-1.5-flash)');
  }
  
  console.log('');
}

// Check Pinecone setup
async function checkPineconeSetup() {
  console.log('Checking Pinecone setup...');
  
  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });
    
    // List indexes
    console.log('Listing Pinecone indexes...');
    const indexes = await pc.listIndexes();
    
    console.log(`Found ${indexes.length} indexes in your Pinecone account:`);
    indexes.forEach(index => console.log(`- ${index.name}`));
    
    // Check if our index exists
    const indexName = process.env.PINECONE_INDEX_NAME;
    const indexExists = indexes.some(i => i.name === indexName);
    
    if (indexExists) {
      console.log(`✅ Index "${indexName}" exists`);
      
      // Check index details
      try {
        const index = pc.index(indexName);
        const stats = await index.describeIndexStats();
        
        console.log('Index details:');
        console.log(`- Dimensions: ${stats.dimension || 'Unknown'}`);
        console.log(`- Total vectors: ${stats.totalVectorCount}`);
        console.log(`- Namespaces: ${Object.keys(stats.namespaces || {}).join(', ') || 'None'}`);
        
        // Try a test operation
        try {
          console.log('Testing query operation...');
          
          // Generate a test vector of the right dimension
          const dimension = stats.dimension || 768;
          const testVector = Array(dimension).fill(0).map(() => Math.random());
          
          const queryResult = await index.query({
            vector: testVector,
            topK: 1,
            includeMetadata: true
          });
          
          console.log('✅ Query operation successful');
          
          if (queryResult.matches && queryResult.matches.length > 0) {
            console.log(`Found ${queryResult.matches.length} matches`);
          } else {
            console.log('No matches found (this is normal if your index is empty)');
          }
        } catch (error) {
          console.error('❌ Error testing query operation:', error.message);
        }
        
      } catch (error) {
        console.error(`❌ Error getting details for index "${indexName}":`, error.message);
      }
    } else {
      console.error(`❌ Index "${indexName}" does not exist`);
      console.log('\nYou need to create this index in the Pinecone Console:');
      console.log('1. Go to https://app.pinecone.io/');
      console.log(`2. Create an index named "${indexName}"`);
      console.log('3. Set the dimensions to match your embedding model (usually 768 for text-embedding-004)');
      console.log('4. Choose metric: cosine');
      console.log('5. Choose environment: gcp-starter');
    }
  } catch (error) {
    console.error('❌ Error connecting to Pinecone:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Check if your API key is correct in .env.local');
    console.log('2. Make sure your Pinecone account is active');
    console.log('3. Check your internet connection');
  }
}

troubleshootSetup();
