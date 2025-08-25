// Test Together AI embeddings with new Pinecone index
require('dotenv').config({ path: '.env.local' });
const { Pinecone } = require('@pinecone-database/pinecone');

// Together AI embedding function (inline for testing)
async function generateTogetherEmbedding(text) {
  const response = await fetch('https://api.together.xyz/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.TOGETHER_EMBEDDING_MODEL || 'BAAI/bge-base-en-v1.5',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Together API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

async function testTogetherEmbeddingsWithPinecone() {
  console.log('🧪 Testing Together AI Embeddings with New Pinecone Index');
  console.log('═══════════════════════════════════════════════════════════');
  
  try {
    // 1. Test Together AI embedding generation
    console.log('📝 1. Generating embedding with Together AI...');
    const testText = "This is a test document about SQL databases and queries.";
    const embedding = await generateTogetherEmbedding(testText);
    
    console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
    console.log(`📊 First 5 values: [${embedding.slice(0, 5).map(n => n.toFixed(4)).join(', ')}...]`);
    
    // 2. Test Pinecone connection
    console.log('\n🔗 2. Connecting to new Pinecone index...');
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    const indexName = process.env.PINECONE_INDEX_NAME;
    console.log(`📍 Using index: ${indexName}`);
    
    const index = pinecone.index(indexName);
    
    // 3. Test index stats
    console.log('\n📊 3. Getting index statistics...');
    const stats = await index.describeIndexStats();
    console.log(`✅ Index dimensions: ${stats.dimension}`);
    console.log(`📄 Total vectors: ${stats.totalVectorCount || 0}`);
    console.log(`🏷️  Namespaces: ${Object.keys(stats.namespaces || {}).length || 'default'}`);
    
    // 4. Test vector upsert
    console.log('\n📤 4. Testing vector upsert...');
    const testId = `test-${Date.now()}`;
    const upsertResponse = await index.upsert([
      {
        id: testId,
        values: embedding,
        metadata: {
          text: testText,
          source: 'test',
          timestamp: new Date().toISOString()
        }
      }
    ]);
    
    console.log(`✅ Upserted vector with ID: ${testId}`);
    console.log(`📊 Upsert successful:`, upsertResponse ? 'Success' : 'Unknown response');
    
    // 5. Test similarity search
    console.log('\n🔍 5. Testing similarity search...');
    const queryResponse = await index.query({
      vector: embedding,
      topK: 3,
      includeMetadata: true,
      includeValues: false
    });
    
    console.log(`✅ Found ${queryResponse.matches?.length || 0} similar vectors`);
    
    if (queryResponse.matches && queryResponse.matches.length > 0) {
      queryResponse.matches.forEach((match, i) => {
        console.log(`   ${i + 1}. ID: ${match.id} (Score: ${match.score?.toFixed(4)})`);
        console.log(`      Text: ${match.metadata?.text || 'No text'}`);
      });
    }
    
    // 6. Clean up test vector
    console.log('\n🧹 6. Cleaning up test vector...');
    await index.deleteOne(testId);
    console.log(`✅ Deleted test vector: ${testId}`);
    
    console.log('\n🎉 SUCCESS! Together AI + Pinecone Integration Working!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 Configuration Summary:');
    console.log(`   • Together AI Embedding Model: ${process.env.TOGETHER_EMBEDDING_MODEL}`);
    console.log(`   • Embedding Dimensions: ${embedding.length}`);
    console.log(`   • Pinecone Index: ${indexName}`);
    console.log(`   • Index Dimensions: ${stats.dimension}`);
    console.log(`   • USE_GOOGLE_EMBEDDINGS_ONLY: ${process.env.USE_GOOGLE_EMBEDDINGS_ONLY}`);
    console.log('\n✅ Your application is ready to use Together AI embeddings!');
    console.log('📤 You can now upload documents and they will use 1024-dimension embeddings.');
    
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check TOGETHER_API_KEY in .env.local');
    console.error('   2. Check PINECONE_API_KEY in .env.local');
    console.error('   3. Verify PINECONE_INDEX_NAME=document-qa-together');
    console.error('   4. Ensure USE_GOOGLE_EMBEDDINGS_ONLY=false');
    
    if (error.stack) {
      console.error('\n📋 Error Details:');
      console.error(error.stack);
    }
  }
}

// Run the test
testTogetherEmbeddingsWithPinecone();
