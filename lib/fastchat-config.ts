import { FASTCHAT_HOST, FASTCHAT_EMBEDDING_MODEL, FASTCHAT_CHAT_MODEL } from './config';

// Export the models for use in other parts of the application
export { FASTCHAT_EMBEDDING_MODEL, FASTCHAT_CHAT_MODEL };

// Check if FastChat is available
export async function checkFastChatConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${FASTCHAT_HOST}/v1/models`);
    if (!response.ok) {
      console.error('Failed to connect to FastChat server');
      return false;
    }
    
    // Check if required models are available
    const data = await response.json();
    const availableModels = data.data?.map((model: any) => model.id) || [];
    
    // Check if required models exist
    const hasEmbeddingModel = availableModels.includes(FASTCHAT_EMBEDDING_MODEL);
    const hasChatModel = availableModels.includes(FASTCHAT_CHAT_MODEL);
    
    if (!hasEmbeddingModel) {
      console.warn(`Embedding model ${FASTCHAT_EMBEDDING_MODEL} not found. Please make sure it's available in your FastChat server.`);
    }
    
    if (!hasChatModel) {
      console.warn(`Chat model ${FASTCHAT_CHAT_MODEL} not found. Please make sure it's available in your FastChat server.`);
    }
    
    return true;
  } catch (error) {
    console.error('Error connecting to FastChat:', error);
    return false;
  }
}

// Generate embeddings using FastChat
export async function generateFastChatEmbedding(text: string): Promise<number[]> {
  try {
    // Make the embeddings request to the FastChat API
    const response = await fetch(`${FASTCHAT_HOST}/v1/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: FASTCHAT_EMBEDDING_MODEL,
        input: text,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`FastChat API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Generated FastChat embedding with dimension: ${data.data[0].embedding.length}`);
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating FastChat embedding:', error);
    throw new Error('Failed to generate embedding with FastChat');
  }
}

// Generate chat response using FastChat
export async function generateFastChatResponse(prompt: string): Promise<string> {
  try {
    // Make the generation request to the FastChat API
    const response = await fetch(`${FASTCHAT_HOST}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: FASTCHAT_CHAT_MODEL,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });
    
    if (!response.ok) {
      throw new Error(`FastChat API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating FastChat response:', error);
    throw new Error('Failed to generate response with FastChat');
  }
}
