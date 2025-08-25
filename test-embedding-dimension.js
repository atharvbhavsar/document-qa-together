// Test embedding dimension
const fetch = require('node-fetch');

async function testEmbeddingDimension() {
  try {
    const response = await fetch('http://localhost:8001/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'all-MiniLM-L6-v2',
        input: 'This is a test sentence for embedding'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ FastChat API working!');
      console.log(`Model: ${data.model}`);
      console.log(`Embedding dimension: ${data.data[0].embedding.length}`);
      console.log(`Expected: 384 dimensions for all-MiniLM-L6-v2`);
      
      if (data.data[0].embedding.length === 384) {
        console.log('🎉 Perfect! Dimension is correct for Pinecone compatibility');
      } else {
        console.log('❌ Dimension mismatch. Expected 384.');
      }
    } else {
      console.error('❌ API Error:', response.status, await response.text());
    }
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
  }
  
  process.exit(0);
}

testEmbeddingDimension();
