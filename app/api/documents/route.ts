import { NextResponse } from 'next/server';
import { getDocumentList } from '@/lib/pinecone-utils';

export async function GET() {
  try {
    const documents = await getDocumentList();
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error getting document list:', error);
    return NextResponse.json(
      { error: 'Failed to get document list' },
      { status: 500 }
    );
  }
}
