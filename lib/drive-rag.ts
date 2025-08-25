import GoogleDriveService from './google-drive';
import { pinecone } from './config';
import { generateEmbedding } from './document-processor';
import { DocumentProcessorOCR } from './document-processor-ocr';
import { DriveDocument, DocumentChunk } from './types';
import { v4 as uuidv4 } from 'uuid';

export class DriveRAGPipeline {
  private driveService: GoogleDriveService;
  private indexName: string;
  private documentProcessor: DocumentProcessorOCR;

  constructor(indexName: string = 'document-qa-index') {
    this.driveService = new GoogleDriveService();
    this.indexName = indexName;
    this.documentProcessor = new DocumentProcessorOCR();
  }

  async initialize() {
    await this.documentProcessor.initialize();
  }

  /**
   * Set Google Drive credentials
   */
  setDriveCredentials(tokens: any) {
    this.driveService.setTokens(tokens);
  }

  async cleanup() {
    await this.documentProcessor.cleanup();
  }

  /**
   * Auto-index ALL files from Google Drive
   */
  async autoIndexAllDriveFiles(): Promise<DriveDocument[]> {
    if (!this.driveService.isAuthenticated()) {
      throw new Error('Google Drive authentication required');
    }

    console.log('🔍 Starting auto-indexing of ALL Google Drive files...');
    
    // Get all supported files from Drive
    const allFiles = await this.driveService.listFiles(1000); // Get up to 1000 files
    const supportedTypes = [
      'application/vnd.google-apps.document',
      'application/vnd.google-apps.presentation', 
      'application/vnd.google-apps.spreadsheet',
      'application/pdf',
      'text/plain',
      'text/csv'
    ];

    const supportedFiles = allFiles.filter(file => supportedTypes.includes(file.mimeType));
    console.log(`📊 Found ${supportedFiles.length} supported files to index`);

    // Process all files
    const fileIds = supportedFiles.map(file => file.id);
    return await this.ingestDriveDocuments(fileIds);
  }
  async searchDriveDocuments(query: string, maxResults: number = 10): Promise<any[]> {
    if (!this.driveService.isAuthenticated()) {
      throw new Error('Google Drive authentication required');
    }

    // Extract keywords from the query for better search
    const keywords = this.extractKeywords(query);
    
    // Search by keywords first
    let files = await this.driveService.searchByKeywords(keywords);
    
    // If no results, do a broader search
    if (files.length === 0) {
      files = await this.driveService.searchFiles(`fullText contains '${query}'`, maxResults);
    }

    // Filter supported file types
    const supportedTypes = [
      'application/vnd.google-apps.document',
      'application/vnd.google-apps.presentation', 
      'application/vnd.google-apps.spreadsheet',
      'application/pdf',
      'text/plain',
      'text/csv'
    ];

    return files.filter(file => supportedTypes.includes(file.mimeType));
  }

  /**
   * Process and ingest documents from Google Drive into vector database
   */
  async ingestDriveDocuments(fileIds: string[]): Promise<DriveDocument[]> {
    if (!this.driveService.isAuthenticated()) {
      throw new Error('Google Drive authentication required');
    }

    const processedDocs: DriveDocument[] = [];

    for (const fileId of fileIds) {
      try {
        console.log(`Processing file: ${fileId}`);
        
        // Get file content and metadata
        const [fileContent, fileMetadata] = await Promise.all([
          this.driveService.getFileContent(fileId),
          this.driveService.getFileMetadata(fileId)
        ]);

        if (!fileMetadata) {
          console.warn(`File metadata not found for: ${fileId}`);
          continue;
        }

        // Process document with OCR if needed
        const processedDoc = await this.documentProcessor.processDocument(
          Buffer.from(fileContent),
          fileMetadata.mimeType,
          fileMetadata.name,
          fileId
        );

        // Generate embeddings and store in Pinecone
        await this.storeChunksInPinecone(processedDoc.chunks);

        const doc: DriveDocument = {
          ...processedDoc,
          modifiedTime: fileMetadata.modifiedTime,
          webViewLink: fileMetadata.webViewLink
        };

        processedDocs.push(doc);
        console.log(`Successfully processed: ${fileMetadata.name}`);
        
      } catch (error) {
        console.error(`Error processing file ${fileId}:`, error);
      }
    }

    return processedDocs;
  }

  /**
   * Query the vector database for relevant documents
   */
  async queryRelevantDocuments(query: string, topK: number = 5): Promise<any[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query);
      
      // Connect to Pinecone index
      const index = pinecone.index(this.indexName);
      
      // Query the vector database
      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        filter: {
          source: 'google-drive'
        }
      });

      return queryResponse.matches || [];
    } catch (error) {
      console.error('Error querying vector database:', error);
      throw new Error('Failed to query relevant documents');
    }
  }

  /**
   * Answer user question using RAG with Google Drive documents
   */
  async answerQuestion(question: string): Promise<string> {
    try {
      console.log(`🤔 Processing question: "${question}"`);
      
      // 1. Retrieve relevant documents
      const relevantDocs = await this.queryRelevantDocuments(question, 5);
      
      if (relevantDocs.length === 0) {
        return "I could not find relevant information in your Google Drive.";
      }

      console.log(`📋 Found ${relevantDocs.length} relevant document chunks`);

      // 2. Prepare context from retrieved documents with metadata
      const context = relevantDocs.map((doc, index) => {
        const fileName = doc.metadata?.fileName || 'Unknown File';
        const content = doc.metadata?.content || doc.content || '';
        return `Document ${index + 1} (${fileName}):\n${content}`;
      }).join('\n\n');

      // 3. Generate answer using the context
      const prompt = `You are an AI assistant that answers questions based on Google Drive documents. 

Please provide a comprehensive answer based on the provided documents. Focus on answering the user's question thoroughly and accurately.

Context from Google Drive documents:
${context}

Question: ${question}

Answer:`;

      // Use Ollama directly for generating the response
      const { generateOllamaResponse } = await import('@/lib/ollama-config');
      const answer = await generateOllamaResponse(prompt);
      
      // Extract unique files for source citations
      const uniqueFiles = this.extractUniqueFiles(relevantDocs);
      
      // Always append proper source citations with working links
      let finalAnswer = answer;
      
      // Remove any existing source citations that might have placeholders
      finalAnswer = finalAnswer.replace(/📂 Sources:[\s\S]*$/, '').trim();
      
      if (uniqueFiles.length > 0) {
        finalAnswer += `\n\n📂 **Sources:**\n${uniqueFiles.map(file => 
          `• **${file.fileName}**\n  🔗 [Open in Google Drive](https://drive.google.com/file/d/${file.fileId}/view)\n  📄 [Direct PDF Link](https://drive.google.com/uc?id=${file.fileId}&export=download)`
        ).join('\n\n')}`;
      }

      return finalAnswer;

    } catch (error) {
      console.error('Error answering question:', error);
      return "I encountered an error while processing your question. Please try again.";
    }
  }

  /**
   * Extract unique files from relevant documents for source citations
   */
  private extractUniqueFiles(relevantDocs: any[]): Array<{fileName: string, fileId: string}> {
    const uniqueFiles = new Map();
    
    relevantDocs.forEach(doc => {
      const fileId = doc.metadata?.fileId;
      const fileName = doc.metadata?.fileName;
      
      if (fileId && fileName && !uniqueFiles.has(fileId)) {
        uniqueFiles.set(fileId, { fileName, fileId });
      }
    });
    
    return Array.from(uniqueFiles.values());
  }

  /**
   * Extract keywords from query for better search
   */
  private extractKeywords(query: string): string[] {
    // Remove common stop words and extract meaningful terms
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'what', 'when', 'where', 'how', 'why'];
    
    const words = query.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    return Array.from(new Set(words)); // Remove duplicates
  }

  /**
   * Chunk document content into smaller pieces
   */
  private chunkDocument(content: string, fileId: string, fileName: string, pageCount: number = 1): DocumentChunk[] {
    const chunkSize = 1000; // Characters per chunk
    const overlap = 100; // Overlap between chunks
    
    const chunks: DocumentChunk[] = [];
    let startIndex = 0;
    let chunkIndex = 0;

    while (startIndex < content.length) {
      const endIndex = Math.min(startIndex + chunkSize, content.length);
      const chunkContent = content.slice(startIndex, endIndex);
      
      // Estimate current page based on content position
      const currentPage = Math.min(
        Math.ceil((startIndex / content.length) * pageCount),
        pageCount
      );
      
      const chunk: DocumentChunk = {
        id: uuidv4(),
        content: chunkContent,
        metadata: {
          fileId,
          fileName,
          chunkIndex,
          page: currentPage,
          totalPages: pageCount,
          source: 'google-drive'
        }
      };
      
      chunks.push(chunk);
      
      startIndex += chunkSize - overlap;
      chunkIndex++;
    }

    return chunks;
  }

  /**
   * Store document chunks in Pinecone vector database
   */
  private async storeChunksInPinecone(chunks: DocumentChunk[]): Promise<void> {
    try {
      const index = pinecone.index(this.indexName);
      
      // Generate embeddings for each chunk
      const vectors = [];
      
      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk.content);
        
        vectors.push({
          id: chunk.id,
          values: embedding,
          metadata: {
            content: chunk.content,
            ...chunk.metadata
          }
        });
      }

      // Store in batches
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.upsert(batch);
        console.log(`Stored batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(vectors.length / batchSize)}`);
      }

    } catch (error) {
      console.error('Error storing chunks in Pinecone:', error);
      throw new Error('Failed to store document chunks in vector database');
    }
  }
}

export default DriveRAGPipeline;
