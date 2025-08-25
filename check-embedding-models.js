// Check Together AI available embedding models and their dimensions
require('dotenv').config({ path: '.env.local' });

async function checkTogetherEmbeddingModels() {
  console.log('🔍 Checking Together AI Embedding Models');
  console.log('═══════════════════════════════════════════');
  
  const models = [
    'BAAI/bge-base-en-v1.5',
    'BAAI/bge-large-en-v1.5', 
    'WhereIsAI/UAE-Large-V1',
    'text-embedding-ada-002',
    'togethercomputer/m2-bert-80M-8k-retrieval',
    'togethercomputer/m2-bert-80M-32k-retrieval'
  ];
  
  for (const model of models) {
    try {
      console.log(`\n📊 Testing model: ${model}`);
      
      const response = await fetch('https://api.together.xyz/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          input: 'Test embedding dimension',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${response.status} - ${errorText}`);
        continue;
      }

      const data = await response.json();
      const embedding = data.data[0].embedding;
      console.log(`   ✅ Dimensions: ${embedding.length}`);
      console.log(`   📋 First 3 values: [${embedding.slice(0, 3).map(n => n.toFixed(4)).join(', ')}...]`);
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Recommendation:');
  console.log('For 1024 dimensions, look for models that specifically mention 1024d output');
}

checkTogetherEmbeddingModels();
