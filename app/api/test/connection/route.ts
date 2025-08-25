import { NextRequest, NextResponse } from 'next/server';
import { pinecone, PINECONE_INDEX_NAME } from '@/lib/config';

// Test Pinecone connection
export async function GET(request: NextRequest) {
  try {
    // List all indexes
    const indexes = await pinecone.listIndexes();
    
    // Convert indexes to an array if it's not already
    const indexesArray = Array.isArray(indexes) ? indexes : (indexes as any).indexes || [];
    
    return NextResponse.json({
      success: true,
      indexCount: indexesArray.length,
      indexes: indexesArray.map((index: any) => ({
        name: index.name,
        status: index.status,
        host: index.host
      })),
      targetIndex: PINECONE_INDEX_NAME,
      targetExists: indexesArray.some((index: any) => index.name === PINECONE_INDEX_NAME)
    });
  } catch (error) {
    console.error('Pinecone connection error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
