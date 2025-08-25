// Script to check Pinecone index details
const { Pinecone } = require('@pinecone-database/pinecone');

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX_NAME || 'document-qa-index';

async function checkIndex() {
  try {
    const pinecone = new Pinecone({ apiKey });
    
    // List all indexes
    console.log('Fetching all indexes...');
    const indexes = await pinecone.listIndexes();
    console.log('Available indexes:', indexes);
    
    // If the specific index exists, get its details
    if (indexes.some(index => index.name === indexName)) {
      console.log(`\nFetching details for index '${indexName}'...`);
      const index = pinecone.index(indexName);
      const stats = await index.describeIndexStats();
      console.log('Index stats:', JSON.stringify(stats, null, 2));
      
      console.log('\nDimensions:', stats.dimension || 'Not available');
      console.log('Total vector count:', stats.totalVectorCount);
      console.log('Namespaces:', Object.keys(stats.namespaces || {}));
    } else {
      console.log(`\nIndex '${indexName}' not found. Available indexes:`, indexes.map(i => i.name));
    }
  } catch (error) {
    console.error('Error checking Pinecone index:', error);
  }
}

checkIndex();
