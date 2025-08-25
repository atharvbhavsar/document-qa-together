import OpenAI from 'openai';

// OpenAI Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const USE_OPENAI = process.env.USE_OPENAI === 'true';

if (USE_OPENAI && (!OPENAI_API_KEY || OPENAI_API_KEY === '')) {
  console.error('OpenAI API key is missing! Please check your .env.local file.');
}

export const openai = (USE_OPENAI && OPENAI_API_KEY) ? new OpenAI({
  apiKey: OPENAI_API_KEY,
}) : null;

// Model configurations
export const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small'; // 1536 dimensions
export const OPENAI_CHAT_MODEL = 'gpt-3.5-turbo';

// Generate embeddings using OpenAI
export async function generateOpenAIEmbedding(text: string): Promise<number[]> {
  try {
    if (!openai) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await openai.embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input: text,
    });

    const embedding = response.data[0].embedding;
    console.log(`Generated OpenAI embedding with dimension: ${embedding.length}`);
    return embedding;
  } catch (error) {
    console.error('Error generating OpenAI embedding:', error);
    throw new Error('Failed to generate embedding with OpenAI');
  }
}

// Generate chat response using OpenAI
export async function generateOpenAIResponse(
  messages: Array<{ role: string; content: string }>,
  relevantChunks: Array<{ text: string; filename: string; score: number }>
): Promise<string> {
  try {
    if (!openai) {
      throw new Error('OpenAI client not initialized');
    }

    // Create context from relevant chunks
    const context = relevantChunks
      .map((chunk, index) => `[${index + 1}] From "${chunk.filename}": ${chunk.text}`)
      .join('\n\n');

    const systemMessage = {
      role: 'system' as const,
      content: `You are a helpful assistant that answers questions based on the provided document context. 
      Use the following context to answer the user's question. If the answer is not in the context, say so clearly.
      
      Context:
      ${context}`
    };

    const response = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error generating OpenAI chat response:', error);
    throw new Error('Failed to generate chat response with OpenAI');
  }
}
