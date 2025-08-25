const { Pinecone } = require('@pinecone-database/pinecone');

async function createIndex() {
  try {
    const pc = new Pinecone({
      apiKey: 'pcsk_5fpmb3_PjhRHcLLJxJyxNLdQYeWjFH2fsJsZ2N9KU1nPWvUfYCKtZ15T9yqHGLwVL21zrQ'
    });
    
    console.log('Checking if index exists...');
    const indexes = await pc.listIndexes();
    const indexExists = indexes.some(i => i.name === 'document-qa-index');
    
    if (indexExists) {
      console.log('Index "document-qa-index" already exists.');
      console.log('Checking index details...');
      
      try {
        const index = pc.index('document-qa-index');
        const stats = await index.describeIndexStats();
        console.log('Index stats:', stats);
      } catch (error) {
        console.error('Error getting index stats:', error.message);
      }
    } else {
      console.log('Creating index "document-qa-index" with 768 dimensions...');
      
      try {
        await pc.createIndex({
          name: 'document-qa-index',
          dimension: 768,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'gcp',
              region: 'us-central1'
            }
          }
        });
        console.log('Index created successfully!');
      } catch (error) {
        console.error('Error creating index:', error.message);
        console.log('You might need to create the index manually in the Pinecone Console.');
        console.log('https://app.pinecone.io/');
      }
    }
  } catch (error) {
    console.error('Error connecting to Pinecone:', error.message);
  }
}

createIndex();
