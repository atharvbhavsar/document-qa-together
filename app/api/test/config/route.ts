import { NextRequest, NextResponse } from 'next/server';
import { pinecone, PINECONE_INDEX_NAME } from '@/lib/config';

// Get configuration (excluding sensitive info)
export async function GET(request: NextRequest) {
  try {
    const config = {
      apiKey: process.env.PINECONE_API_KEY 
        ? `***${process.env.PINECONE_API_KEY.slice(-4)}` 
        : null,
      indexName: PINECONE_INDEX_NAME
    };
    
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch configuration' 
    }, { status: 500 });
  }
}
