const { Pinecone } = require('@pinecone-database/pinecone');

async function checkPineconeIndex() {
  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || 'pcsk_5fpmb3_PjhRHcLLJxJyxNLdQYeWjFH2fsJsZ2N9KU1nPWvUfYCKtZ15T9yqHGLwVL21zrQ'
    });

    const indexName = 'document-qa-index';
    
    // Get index description
    const indexDescription = await pc.describeIndex(indexName);
    console.log('📊 Pinecone Index Configuration:');
    console.log(`   Name: ${indexDescription.name}`);
    console.log(`   Dimension: ${indexDescription.dimension}`);
    console.log(`   Metric: ${indexDescription.metric}`);
    console.log(`   Status: ${indexDescription.status.ready ? '✅ Ready' : '❌ Not Ready'}`);
    
  } catch (error) {
    console.error('❌ Error checking Pinecone index:', error.message);
  }
}

checkPineconeIndex();
