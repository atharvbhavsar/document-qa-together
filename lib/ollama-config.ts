import { OLLAMA_HOST, OLLAMA_EMBEDDING_MODEL, OLLAMA_CHAT_MODEL } from './config';

// Export the models for use in other parts of the application
export { OLLAMA_EMBEDDING_MODEL, OLLAMA_CHAT_MODEL };

// Since we have issues with the ollama package in Next.js, we'll use direct API calls
// This eliminates the need for the problematic ES modules import

// Check if Ollama is available
export async function checkOllamaConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`);
    if (!response.ok) {
      console.error('Failed to connect to Ollama server');
      return false;
    }
    
    // Check if required models are available
    const data = await response.json();
    const availableModels = data.models?.map((model: any) => model.name) || [];
    
    // Check if required models exist
    const hasEmbeddingModel = availableModels.includes(OLLAMA_EMBEDDING_MODEL);
    const hasChatModel = availableModels.includes(OLLAMA_CHAT_MODEL);
    
    if (!hasEmbeddingModel) {
      console.warn(`Embedding model ${OLLAMA_EMBEDDING_MODEL} not found. Please run: ollama pull ${OLLAMA_EMBEDDING_MODEL}`);
    }
    
    if (!hasChatModel) {
      console.warn(`Chat model ${OLLAMA_CHAT_MODEL} not found. Please run: ollama pull ${OLLAMA_CHAT_MODEL}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error connecting to Ollama:', error);
    return false;
  }
}

// Generate embeddings using Ollama
export async function generateOllamaEmbedding(text: string): Promise<number[]> {
  try {
    // Make the embeddings request directly to the Ollama API
    const response = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_EMBEDDING_MODEL,
        prompt: text,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Generated Ollama embedding with dimension: ${data.embedding.length}`);
    return data.embedding;
  } catch (error) {
    console.error('Error generating Ollama embedding:', error);
    throw new Error('Failed to generate embedding with Ollama');
  }
}

// Generate chat response using Ollama
export async function generateOllamaResponse(prompt: string): Promise<string> {
  try {
    // Make the generation request directly to the Ollama API
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_CHAT_MODEL,
        prompt: prompt,
        stream: false,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.response || '';
  } catch (error) {
    console.error('Error generating Ollama response:', error);
    throw new Error('Failed to generate response with Ollama');
  }
}
