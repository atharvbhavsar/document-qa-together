// Create new Pinecone index for Together AI embeddings
require('dotenv').config({ path: '.env.local' });
const { Pinecone } = require('@pinecone-database/pinecone');

async function createTogetherAIIndex() {
  console.log('🔑 Loading environment variables...');
  
  if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY not found in environment variables');
  }
  
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const indexName = 'document-qa-together';
  
  try {
    console.log('🔍 Checking if index exists...');
    
    // Check if index already exists
    const existingIndexes = await pinecone.listIndexes();
    const indexExists = existingIndexes.indexes?.some(index => index.name === indexName);
    
    if (indexExists) {
      console.log(`✅ Index "${indexName}" already exists!`);
      return indexName;
    }

    console.log('🚀 Creating new Pinecone index...');
    
    await pinecone.createIndex({
      name: indexName,
      dimension: 1024, // Together AI embedding dimension
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });

    console.log(`✅ Successfully created index: ${indexName}`);
    console.log('📋 Index details:');
    console.log(`   - Name: ${indexName}`);
    console.log(`   - Dimensions: 1024`);
    console.log(`   - Metric: cosine`);
    console.log(`   - Cloud: AWS us-east-1`);
    
    // Wait for index to be ready
    console.log('⏳ Waiting for index to be ready...');
    let isReady = false;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (!isReady && attempts < maxAttempts) {
      try {
        const indexDesc = await pinecone.describeIndex(indexName);
        if (indexDesc.status?.ready) {
          isReady = true;
          console.log('✅ Index is ready for use!');
        } else {
          console.log(`⏳ Index status: ${indexDesc.status?.state || 'initializing'}`);
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          attempts++;
        }
      } catch (error) {
        console.log(`⏳ Waiting for index to initialize... (${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }
    }
    
    if (!isReady) {
      console.log('⚠️ Index creation may still be in progress. Check Pinecone console.');
    }
    
    return indexName;
    
  } catch (error) {
    console.error('❌ Error creating index:', error);
    
    if (error.message?.includes('already exists')) {
      console.log(`✅ Index "${indexName}" already exists!`);
      return indexName;
    }
    
    throw error;
  }
}

// Run the function
createTogetherAIIndex()
  .then(indexName => {
    console.log('');
    console.log('🎉 Setup Complete!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Update your .env.local file:');
    console.log(`   PINECONE_INDEX_NAME=${indexName}`);
    console.log('2. Set Together AI for embeddings:');
    console.log('   USE_GOOGLE_EMBEDDINGS_ONLY=false');
    console.log('3. Restart your application');
    console.log('4. Re-upload your documents');
  })
  .catch(error => {
    console.error('❌ Failed to create index:', error);
    process.exit(1);
  });
