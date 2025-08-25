import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';

// Feature flags for model selection
export const USE_OLLAMA = process.env.USE_OLLAMA === 'true';
export const USE_FASTCHAT = process.env.USE_FASTCHAT === 'true';
export const USE_OPENAI = process.env.USE_OPENAI === 'true';
export const USE_VLLM = process.env.USE_VLLM === 'true';
export const USE_TOGETHER = process.env.USE_TOGETHER === 'true';
export const USE_GOOGLE_EMBEDDINGS_ONLY = process.env.USE_GOOGLE_EMBEDDINGS_ONLY === 'true';

// Google Gemini Configuration (used as fallback if other providers are not available)
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!USE_OLLAMA && !USE_FASTCHAT && !USE_OPENAI && !USE_VLLM && !USE_TOGETHER && (!GOOGLE_API_KEY || GOOGLE_API_KEY === '')) {
  console.error('Google API key is missing! Please check your .env.local file.');
}

export const genAI = (!USE_OLLAMA && !USE_FASTCHAT && !USE_OPENAI && !USE_VLLM && !USE_TOGETHER) ? new GoogleGenerativeAI(GOOGLE_API_KEY!) : null;

// Pinecone Configuration
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;

if (!PINECONE_API_KEY || PINECONE_API_KEY === '') {
  console.error('Pinecone API key is missing! Please check your .env.local file.');
}

export const pinecone = PINECONE_API_KEY ? new Pinecone({
  apiKey: PINECONE_API_KEY,
}) : null;

export const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'document-qa-index';

// Get Pinecone index
export const getPineconeIndex = () => {
  if (!pinecone) {
    throw new Error('Pinecone client not initialized. Please check your PINECONE_API_KEY.');
  }
  
  try {
    console.log(`Connecting to Pinecone index: ${PINECONE_INDEX_NAME}`);
    return pinecone.index(PINECONE_INDEX_NAME);
  } catch (error) {
    console.error(`Error connecting to Pinecone index: ${error}`);
    throw new Error(`Failed to connect to Pinecone index: ${PINECONE_INDEX_NAME}`);
  }
};

// Embedding model configuration
export const EMBEDDING_MODEL = 'text-embedding-004';
export const CHAT_MODEL = 'gemini-1.5-pro';

// Ollama model configuration
export const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
export const OLLAMA_EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text:latest';
// Force use of llama3:latest to avoid any environment variable conflicts
export const OLLAMA_CHAT_MODEL = 'llama3:latest';

// FastChat model configuration
export const FASTCHAT_HOST = process.env.FASTCHAT_HOST || 'http://localhost:8001';
export const FASTCHAT_EMBEDDING_MODEL = process.env.FASTCHAT_EMBEDDING_MODEL || 'all-MiniLM-L6-v2';
export const FASTCHAT_CHAT_MODEL = process.env.FASTCHAT_CHAT_MODEL || 'vicuna-7b-v1.5';

// vLLM model configuration
export const VLLM_HOST = process.env.VLLM_HOST || 'http://localhost:8000';
export const VLLM_EMBEDDING_MODEL = process.env.VLLM_EMBEDDING_MODEL || 'BAAI/bge-small-en-v1.5';
export const VLLM_CHAT_MODEL = process.env.VLLM_CHAT_MODEL || 'microsoft/DialoGPT-medium';

// Together AI model configuration
export const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
export const TOGETHER_EMBEDDING_MODEL = process.env.TOGETHER_EMBEDDING_MODEL || 'BAAI/bge-base-en-v1.5';
export const TOGETHER_CHAT_MODEL = process.env.TOGETHER_CHAT_MODEL || 'mistralai/Mixtral-8x7B-Instruct-v0.1';

// Document processing configuration
export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 200;
