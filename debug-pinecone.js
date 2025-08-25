// Simple test script to check Pinecone API structure
// This file is just for development to debug the Pinecone API structure

require('dotenv').config({ path: '.env.local' });
const { Pinecone } = require('@pinecone-database/pinecone');

async function debugPinecone() {
  try {
    console.log('Testing Pinecone API...');
    
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });
    
    console.log('Fetching indexes...');
    const indexes = await pc.listIndexes();
    
    console.log('Raw indexes response:', indexes);
    console.log('Type of indexes:', typeof indexes);
    console.log('Is array:', Array.isArray(indexes));
    
    // Try to access properties based on structure
    if (typeof indexes === 'object') {
      if (Array.isArray(indexes)) {
        console.log('Number of indexes (array):', indexes.length);
        indexes.forEach((index, i) => {
          console.log(`Index ${i}:`, index);
        });
      } else {
        console.log('Indexes object keys:', Object.keys(indexes));
        if ('indexes' in indexes) {
          console.log('Number of indexes (property):', indexes.indexes.length);
          indexes.indexes.forEach((index, i) => {
            console.log(`Index ${i}:`, index);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugPinecone();
