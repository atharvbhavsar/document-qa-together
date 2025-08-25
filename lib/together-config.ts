// Together AI Configuration
import { TOGETHER_API_KEY, TOGETHER_EMBEDDING_MODEL, TOGETHER_CHAT_MODEL } from './config';

interface TogetherEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

interface TogetherChatResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
  created: number;
  model: string;
  object: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate embeddings using Together AI
 * Uses BAAI/bge-large-en-v1.5 model for high-quality embeddings
 */
export async function generateTogetherEmbedding(text: string): Promise<number[]> {
  if (!TOGETHER_API_KEY) {
    throw new Error('Together AI API key is not configured');
  }

  try {
    console.log('Generating Together AI embedding...');
    
    const response = await fetch('https://api.together.xyz/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: TOGETHER_EMBEDDING_MODEL,
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Together AI embedding error:', response.status, errorText);
      throw new Error(`Together AI embedding API error: ${response.status} - ${errorText}`);
    }

    const data: TogetherEmbeddingResponse = await response.json();
    
    if (!data.data || data.data.length === 0 || !data.data[0].embedding) {
      throw new Error('Invalid embedding response from Together AI');
    }

    const embedding = data.data[0].embedding;
    console.log(`Generated Together AI embedding with dimension: ${embedding.length}`);
    
    return embedding;
  } catch (error) {
    console.error('Error generating Together AI embedding:', error);
    throw new Error('Failed to generate embedding with Together AI');
  }
}

/**
 * Generate chat response using Together AI
 * Uses Llama-2-70b-chat-hf for high-quality responses
 */
export async function generateTogetherResponse(prompt: string): Promise<string> {
  if (!TOGETHER_API_KEY) {
    throw new Error('Together AI API key is not configured');
  }

  try {
    console.log('Generating Together AI chat response...');
    
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: TOGETHER_CHAT_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        repetition_penalty: 1,
        stop: ["<|endoftext|>", "</s>"],
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Together AI chat error:', response.status, errorText);
      throw new Error(`Together AI chat API error: ${response.status} - ${errorText}`);
    }

    const data: TogetherChatResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      throw new Error('Invalid chat response from Together AI');
    }

    const responseText = data.choices[0].message.content;
    console.log('Successfully generated Together AI response');
    
    return responseText.trim();
  } catch (error) {
    console.error('Error generating Together AI response:', error);
    throw new Error('Failed to generate response with Together AI');
  }
}

/**
 * Test Together AI connectivity
 */
export async function testTogetherConnection(): Promise<boolean> {
  try {
    const testEmbedding = await generateTogetherEmbedding("Hello, this is a test.");
    return testEmbedding.length > 0;
  } catch (error) {
    console.error('Together AI connection test failed:', error);
    return false;
  }
}
