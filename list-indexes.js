const { Pinecone } = require('@pinecone-database/pinecone');

async function listIndexes() {
  try {
    const pc = new Pinecone({
      apiKey: 'pcsk_5fpmb3_PjhRHcLLJxJyxNLdQYeWjFH2fsJsZ2N9KU1nPWvUfYCKtZ15T9yqHGLwVL21zrQ'
    });
    
    console.log('Listing all Pinecone indexes...');
    const indexes = await pc.listIndexes();
    
    if (indexes.length === 0) {
      console.log('No indexes found in your Pinecone account.');
      console.log('You need to create an index named "document-qa-index" with 768 dimensions.');
    } else {
      console.log('Available indexes:');
      indexes.forEach(index => {
        console.log(`- ${index.name}`);
      });
    }
  } catch (error) {
    console.error('Error connecting to Pinecone:', error.message);
    if (error.message.includes('401')) {
      console.log('Authentication error: Your Pinecone API key may be incorrect or expired.');
    } else if (error.message.includes('404')) {
      console.log('Not found error: The resource you\'re trying to access doesn\'t exist.');
    }
  }
}

listIndexes();
