import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import DriveRAGPipeline from '@/lib/drive-rag';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('google_access_token');
    const refreshToken = cookieStore.get('google_refresh_token');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Google Drive authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fileIds } = body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: 'File IDs array is required' },
        { status: 400 }
      );
    }

    const pipeline = new DriveRAGPipeline();
    await pipeline.initialize();

    try {
      const tokens = {
        access_token: accessToken.value,
        refresh_token: refreshToken?.value
      };
      
      pipeline.setDriveCredentials(tokens);
      const processedDocs = await pipeline.ingestDriveDocuments(fileIds);

      // Count OCR processed documents
      const ocrProcessed = processedDocs.filter(doc => 
        doc.mimeType.includes('pdf') || doc.mimeType.includes('image')
      ).length;

      return NextResponse.json({ 
        success: true, 
        processedDocuments: processedDocs.length,
        ocrProcessed,
        documents: processedDocs.map(doc => ({
          id: doc.id,
          name: doc.name,
          chunksCount: doc.chunks.length,
          mimeType: doc.mimeType,
          processingError: doc.processingError
        }))
      });
    } finally {
      await pipeline.cleanup();
    }

  } catch (error) {
    console.error('Error ingesting Google Drive documents:', error);
    return NextResponse.json(
      { error: 'Failed to ingest Google Drive documents' },
      { status: 500 }
    );
  }
}
