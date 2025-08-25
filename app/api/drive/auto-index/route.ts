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

    console.log('🚀 Starting auto-indexing of ALL Google Drive files...');
    
    const pipeline = new DriveRAGPipeline();
    await pipeline.initialize();

    try {
      const tokens = {
        access_token: accessToken.value,
        refresh_token: refreshToken?.value
      };
      
      pipeline.setDriveCredentials(tokens);
      const processedDocs = await pipeline.autoIndexAllDriveFiles();

      // Count OCR processed documents
      const ocrProcessed = processedDocs.filter(doc => 
        doc.mimeType.includes('pdf') || doc.mimeType.includes('image')
      ).length;

      console.log(`✅ Successfully indexed ${processedDocs.length} documents (${ocrProcessed} with OCR)`);

      return NextResponse.json({ 
        success: true, 
        message: `Successfully indexed ${processedDocs.length} documents from your entire Google Drive!`,
        processedCount: processedDocs.length,
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
    console.error('Error auto-indexing Google Drive:', error);
    return NextResponse.json(
      { error: 'Failed to auto-index Google Drive documents' },
      { status: 500 }
    );
  }
}
