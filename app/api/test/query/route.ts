import { NextRequest, NextResponse } from 'next/server';
import { pinecone, PINECONE_INDEX_NAME } from '@/lib/config';
import { generateEmbedding } from '@/lib/document-processor';

// Test vector query
export async function GET(request: NextRequest) {
  try {
    // We'll skip the index existence check and just try to use it directly
    // This is more reliable than trying to check if it exists first
    
    // Generate a test embedding
    const testText = "This is a test query to verify Pinecone search.";
    const embedding = await generateEmbedding(testText);
    
    // Get the index
    const index = pinecone.index(PINECONE_INDEX_NAME);
    
    // Query the index
    const queryResult = await index.query({
      vector: embedding,
      topK: 3,
      includeMetadata: true
    });
    
    return NextResponse.json({
      success: true,
      matches: queryResult.matches || [],
      queryText: testText,
      matchCount: (queryResult.matches || []).length
    });
  } catch (error) {
    console.error('Test query error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
