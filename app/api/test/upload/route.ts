import { NextRequest, NextResponse } from 'next/server';
import { pinecone, PINECONE_INDEX_NAME } from '@/lib/config';
import { generateEmbedding } from '@/lib/document-processor';

// Test vector upload
export async function GET(request: NextRequest) {
  try {
    // We'll skip the index existence check and just try to use it directly
    // This is more reliable than trying to check if it exists first
    
    // Generate a test embedding
    const testText = "This is a test document to verify Pinecone connection.";
    const embedding = await generateEmbedding(testText);
    
    // Get the index
    const index = pinecone.index(PINECONE_INDEX_NAME);
    
    // Create a test vector
    const testId = `test-vector-${Date.now()}`;
    await index.upsert([{
      id: testId,
      values: embedding,
      metadata: { text: testText }
    }]);
    
    return NextResponse.json({
      success: true,
      id: testId,
      dimension: embedding.length,
      text: testText
    });
  } catch (error) {
    console.error('Test upload error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
