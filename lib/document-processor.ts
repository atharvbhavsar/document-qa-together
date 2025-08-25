import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { CHUNK_SIZE, CHUNK_OVERLAP, EMBEDDING_MODEL, genAI, USE_OLLAMA, USE_FASTCHAT, USE_OPENAI, USE_VLLM, USE_TOGETHER, USE_GOOGLE_EMBEDDINGS_ONLY } from './config';
import { v4 as uuidv4 } from 'uuid';

export interface DocumentChunk {
  id: string;
  text: string;
  metadata: {
    filename: string;
    chunkIndex: number;
    totalChunks: number;
    isImportantDocument?: boolean;
    pageNumber?: number;
    startPosition?: number;
    endPosition?: number;
  };
}

// Extract text from PDF with page information
export async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; pageCount: number; pages: Array<{ pageNumber: number; text: string; startPosition: number; endPosition: number }> }> {
  try {
    const data = await pdfParse(buffer);
    
    // Try to extract page-by-page information if available
    const pages: Array<{ pageNumber: number; text: string; startPosition: number; endPosition: number }> = [];
    let currentPosition = 0;
    
    // If we have page info, use it; otherwise treat as single page
    if (data.numpages > 1) {
      // For multi-page PDFs, try to split text by common page indicators
      const pageBreakPattern = /\f|\n\s*\n\s*\n|\n\s*Page\s+\d+|\n\s*\d+\s*\n/g;
      const pageTexts = data.text.split(pageBreakPattern);
      
      pageTexts.forEach((pageText: string, index: number) => {
        if (pageText.trim()) {
          const startPos = currentPosition;
          const endPos = currentPosition + pageText.length;
          pages.push({
            pageNumber: index + 1,
            text: pageText.trim(),
            startPosition: startPos,
            endPosition: endPos
          });
          currentPosition = endPos;
        }
      });
    } else {
      // Single page or unknown page structure
      pages.push({
        pageNumber: 1,
        text: data.text,
        startPosition: 0,
        endPosition: data.text.length
      });
    }
    
    return {
      text: data.text,
      pageCount: data.numpages || 1,
      pages
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Extract text from DOCX with basic structure information
export async function extractTextFromDOCX(buffer: Buffer): Promise<{ text: string; pageCount: number; pages: Array<{ pageNumber: number; text: string; startPosition: number; endPosition: number }> }> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    
    // For DOCX, we don't have reliable page information, so treat as single page
    // or try to split by common patterns
    const pages: Array<{ pageNumber: number; text: string; startPosition: number; endPosition: number }> = [];
    
    // Try to split by page break patterns or large gaps
    const pageBreakPattern = /\n\s*\n\s*\n\s*\n|\n\s*Page\s+\d+/g;
    const pageTexts = text.split(pageBreakPattern);
    let currentPosition = 0;
    
    if (pageTexts.length > 1) {
      pageTexts.forEach((pageText: string, index: number) => {
        if (pageText.trim()) {
          const startPos = currentPosition;
          const endPos = currentPosition + pageText.length;
          pages.push({
            pageNumber: index + 1,
            text: pageText.trim(),
            startPosition: startPos,
            endPosition: endPos
          });
          currentPosition = endPos;
        }
      });
    } else {
      // Single section
      pages.push({
        pageNumber: 1,
        text: text,
        startPosition: 0,
        endPosition: text.length
      });
    }
    
    return {
      text,
      pageCount: pages.length,
      pages
    };
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

// Split text into chunks with page information
export function splitTextIntoChunks(
  text: string, 
  filename: string, 
  pages?: Array<{ pageNumber: number; text: string; startPosition: number; endPosition: number }>
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  
  // Helper function to find which page a position belongs to
  const findPageForPosition = (position: number): number => {
    if (!pages || pages.length === 0) return 1;
    
    for (const page of pages) {
      if (position >= page.startPosition && position <= page.endPosition) {
        return page.pageNumber;
      }
    }
    return pages[0]?.pageNumber || 1;
  };
  
  // Check if this is a certificate or important document based on filename
  const isImportantDocument = filename.toLowerCase().includes('certificate') || 
                             filename.toLowerCase().includes('caste') ||
                             filename.toLowerCase().includes('validity') ||
                             filename.toLowerCase().includes('official') ||
                             filename.toLowerCase().includes('school') ||
                             filename.toLowerCase().includes('leaving') ||
                             filename.toLowerCase().includes('id');
  
  // For certificates and important documents, we'll use a different chunking strategy
  // to keep more context together
  if (isImportantDocument && text.length < CHUNK_SIZE * 2) {
    console.log(`Detected important document (${filename}). Using special chunking strategy to preserve context.`);
    
    // For small certificates, keep the whole document as one chunk if possible
    if (text.length <= CHUNK_SIZE) {
      chunks.push({
        id: `${filename}-full-document`,
        text: text,
        metadata: {
          filename,
          chunkIndex: 0,
          totalChunks: 1,
          isImportantDocument: true,
          pageNumber: findPageForPosition(0),
          startPosition: 0,
          endPosition: text.length
        },
      });
      return chunks;
    }
    
    // For larger certificates, try to chunk at logical boundaries but with more overlap
    // to preserve context between chunks
    const enhancedChunkSize = Math.min(CHUNK_SIZE, Math.ceil(text.length / 2));
    const enhancedOverlap = Math.min(CHUNK_OVERLAP * 2, Math.floor(enhancedChunkSize * 0.5));
    
    let startIndex = 0;
    let chunkIndex = 0;
    
    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + enhancedChunkSize, text.length);
      const chunkText = text.substring(startIndex, endIndex);
      
      chunks.push({
        id: `${filename}-chunk-${chunkIndex}`,
        text: chunkText,
        metadata: {
          filename,
          chunkIndex,
          totalChunks: 0, // Will be updated later
          isImportantDocument: true,
          pageNumber: findPageForPosition(startIndex),
          startPosition: startIndex,
          endPosition: endIndex
        },
      });
      
      chunkIndex++;
      startIndex = endIndex - enhancedOverlap;
    }
    
    // Update total chunks count
    chunks.forEach(chunk => {
      chunk.metadata.totalChunks = chunks.length;
    });
    
    return chunks;
  }
  
  // Standard chunking for other documents
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  let chunkIndex = 0;
  let chunkStartPosition = 0;
  let currentPosition = 0;
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + trimmedSentence;
    
    if (potentialChunk.length <= CHUNK_SIZE) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk) {
        const chunkEndPosition = chunkStartPosition + currentChunk.length;
        chunks.push({
          id: `${filename}-chunk-${chunkIndex}`,
          text: currentChunk,
          metadata: {
            filename,
            chunkIndex,
            totalChunks: 0, // Will be updated later
            pageNumber: findPageForPosition(chunkStartPosition),
            startPosition: chunkStartPosition,
            endPosition: chunkEndPosition
          },
        });
        chunkIndex++;
        chunkStartPosition = chunkEndPosition;
      }
      currentChunk = trimmedSentence;
    }
    currentPosition += trimmedSentence.length;
  }
  
  // Add the last chunk
  if (currentChunk) {
    const chunkEndPosition = chunkStartPosition + currentChunk.length;
    chunks.push({
      id: `${filename}-chunk-${chunkIndex}`,
      text: currentChunk,
      metadata: {
        filename,
        chunkIndex,
        totalChunks: 0,
        pageNumber: findPageForPosition(chunkStartPosition),
        startPosition: chunkStartPosition,
        endPosition: chunkEndPosition
      },
    });
  }
  
  // Update total chunks count
  chunks.forEach(chunk => {
    chunk.metadata.totalChunks = chunks.length;
  });
  
  return chunks;
}

// Generate embeddings using Google Gemini
export async function generateEmbedding(text: string): Promise<number[]> {
  // If USE_GOOGLE_EMBEDDINGS_ONLY is set, always use Google AI for embeddings to maintain compatibility
  if (USE_GOOGLE_EMBEDDINGS_ONLY) {
    // Use Google AI for embeddings to ensure 768 dimensions
    try {
      if (!genAI) {
        throw new Error('Google AI is not configured. Please provide a valid GOOGLE_API_KEY');
      }
      
      const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
      
      // Simple retry logic for rate limits
      const maxRetries = 3;
      let retryCount = 0;
      let lastError = null;
      
      while (retryCount < maxRetries) {
        try {
          const result = await model.embedContent(text);
          const values = result.embedding.values;
          
          // Log the dimension size for debugging
          console.log(`Generated Google AI embedding with dimension: ${values.length}`);
          
          return values;
        } catch (error: any) {
          console.error(`Google AI embedding error (attempt ${retryCount + 1}):`, error);
          lastError = error;
          retryCount++;
          
          if (retryCount < maxRetries) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          }
        }
      }
      
      // If all retries failed, throw the last error
      throw lastError;
    } catch (error) {
      console.error('Error generating Google AI embedding:', error);
      throw new Error('Failed to generate embedding with Google AI');
    }
  }
  
  // Use Ollama if enabled
  if (USE_OLLAMA) {
    const { generateOllamaEmbedding } = await import('./ollama-config');
    return generateOllamaEmbedding(text);
  }
  
  // Use FastChat if enabled
  if (USE_FASTCHAT) {
    const { generateFastChatEmbedding } = await import('./fastchat-config');
    return generateFastChatEmbedding(text);
  }
  
  // Use OpenAI if enabled
  if (USE_OPENAI) {
    const { generateOpenAIEmbedding } = await import('./openai-config');
    return generateOpenAIEmbedding(text);
  }
  
  // Use vLLM if enabled
  if (USE_VLLM) {
    const { generateVLLMEmbedding } = await import('./vllm-config');
    return generateVLLMEmbedding(text);
  }
  
  // Use Together AI if enabled
  if (USE_TOGETHER) {
    const { generateTogetherEmbedding } = await import('./together-config');
    return generateTogetherEmbedding(text);
  }
  
  try {
    if (!genAI) {
      throw new Error('Google API is not configured. Please set USE_OLLAMA=false, USE_FASTCHAT=false, USE_OPENAI=false, USE_VLLM=false, USE_TOGETHER=false and provide a valid GOOGLE_API_KEY');
    }
    
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    
    // Simple retry logic for rate limits
    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;
    
    while (retryCount < maxRetries) {
      try {
        const result = await model.embedContent(text);
        const values = result.embedding.values;
        
        // Log the dimension size for debugging
        console.log(`Generated embedding with dimension: ${values.length}`);
        
        // Add padding or truncation if needed for your Pinecone index
        // If your index has different dimensions than the default 768
        return values;
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a rate limit error
        const isRateLimitError = 
          error.message && (
            error.message.includes('Quota exceeded') ||
            error.message.includes('rate limit') ||
            error.message.includes('Too Many Requests') ||
            error.message.includes('429')
          );
        
        if (!isRateLimitError) {
          throw error; // Not a rate limit error, rethrow immediately
        }
        
        retryCount++;
        
        if (retryCount >= maxRetries) {
          console.error(`Max retries (${maxRetries}) reached for rate limit.`);
          // Instead of throwing the original error, throw a more user-friendly error
          throw new Error('API rate limit exceeded. Please wait a moment and try again.');
        }
        
        // Calculate exponential backoff wait time (1s, 2s, 4s)
        const waitTime = Math.pow(2, retryCount - 1) * 1000;
        console.log(`Rate limit hit. Retrying in ${waitTime}ms (attempt ${retryCount}/${maxRetries})`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw new Error('API rate limit exceeded. Please wait a moment and try again.');
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    
    // Check if it's a rate limit error
    if (error.message && (
      error.message.includes('Quota exceeded') ||
      error.message.includes('rate limit') ||
      error.message.includes('Too Many Requests') ||
      error.message.includes('429')
    )) {
      throw new Error('API rate limit exceeded. Please wait a moment and try again.');
    }
    
    throw new Error('Failed to generate embedding');
  }
}
