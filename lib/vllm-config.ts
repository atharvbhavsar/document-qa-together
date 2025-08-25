// vLLM Configuration and API Functions
import { VLLM_HOST, VLLM_EMBEDDING_MODEL, VLLM_CHAT_MODEL } from './config';

// Generate embeddings using vLLM API (OpenAI-compatible)
export async function generateVLLMEmbedding(text: string): Promise<number[]> {
  try {
    console.log(`🔗 Connecting to vLLM at ${VLLM_HOST}`);
    console.log(`📊 Using embedding model: ${VLLM_EMBEDDING_MODEL}`);

    const response = await fetch(`${VLLM_HOST}/v1/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: VLLM_EMBEDDING_MODEL,
        input: text,
        encoding_format: 'float',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ vLLM embedding API error: ${response.status} - ${errorText}`);
      throw new Error(`vLLM embedding API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      console.error('❌ Invalid response format from vLLM embedding API:', data);
      throw new Error('Invalid response format from vLLM embedding API');
    }

    const embedding = data.data[0].embedding;
    console.log(`✅ vLLM embedding generated successfully! Dimension: ${embedding.length}`);
    
    return embedding;
  } catch (error) {
    console.error('❌ Error generating vLLM embedding:', error);
    throw error;
  }
}

// Generate chat response using vLLM API (OpenAI-compatible)
export async function generateVLLMResponse(
  context: string,
  question: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  try {
    console.log(`🔗 Connecting to vLLM chat at ${VLLM_HOST}`);
    console.log(`🤖 Using chat model: ${VLLM_CHAT_MODEL}`);

    // Prepare messages array
    const messages = [
      {
        role: 'system',
        content: `You are a helpful AI assistant that answers questions based on the provided context. 
        
Context: ${context}

Please provide accurate, helpful answers based on the context above. If the question cannot be answered from the context, please say so.`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: question
      }
    ];

    const response = await fetch(`${VLLM_HOST}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: VLLM_CHAT_MODEL,
        messages: messages,
        max_tokens: 2048,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ vLLM chat API error: ${response.status} - ${errorText}`);
      throw new Error(`vLLM chat API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid response format from vLLM chat API:', data);
      throw new Error('Invalid response format from vLLM chat API');
    }

    const responseText = data.choices[0].message.content;
    console.log(`✅ vLLM chat response generated successfully!`);
    
    return responseText;
  } catch (error) {
    console.error('❌ Error generating vLLM response:', error);
    throw error;
  }
}

// Test vLLM connection
export async function testVLLMConnection(): Promise<{ embedding: boolean; chat: boolean }> {
  const results = {
    embedding: false,
    chat: false
  };

  // Test embedding endpoint
  try {
    const embedding = await generateVLLMEmbedding('Test embedding');
    if (embedding && embedding.length > 0) {
      results.embedding = true;
      console.log('✅ vLLM embedding endpoint working');
    }
  } catch (error) {
    console.error('❌ vLLM embedding endpoint failed:', error);
  }

  // Test chat endpoint
  try {
    const response = await generateVLLMResponse('This is test context.', 'Hello, how are you?');
    if (response && response.length > 0) {
      results.chat = true;
      console.log('✅ vLLM chat endpoint working');
    }
  } catch (error) {
    console.error('❌ vLLM chat endpoint failed:', error);
  }

  return results;
}
