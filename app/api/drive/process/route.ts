import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import GoogleDriveService from '@/lib/google-drive';
import { storeDocumentChunks } from '@/lib/pinecone-utils';
import { generateEmbedding } from '@/lib/document-processor';
import { getPineconeIndex } from '@/lib/config';

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

    const { fileId, fileName, mimeType } = await request.json();

    if (!fileId || !fileName) {
      return NextResponse.json(
        { error: 'File ID and name are required' },
        { status: 400 }
      );
    }

    // Set up Google Drive service with tokens from cookies
    const driveService = new GoogleDriveService();
    const tokens = {
      access_token: accessToken.value,
      refresh_token: refreshToken?.value
    };
    driveService.setTokens(tokens);

    console.log(`Processing Google Drive file: ${fileName} (${mimeType})`);

    // Download and extract content from the file
    let content = '';
    try {
      content = await driveService.getFileContent(fileId);
    } catch (error) {
      console.error('Error getting file content:', error);
      return NextResponse.json(
        { error: `Failed to download file: ${fileName}` },
        { status: 500 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: `No readable content found in file: ${fileName}` },
        { status: 400 }
      );
    }

    // Split content into chunks for processing
    const chunkSize = 1000;
    const chunks = [];
    const totalChunksEstimate = Math.ceil(content.length / chunkSize);
    
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.slice(i, i + chunkSize);
      if (chunk.trim().length > 50) { // Only process meaningful chunks
        chunks.push({
          id: `gdrive_${fileId}_${Math.floor(i / chunkSize)}`,
          text: chunk.trim(),
          metadata: {
            filename: fileName,
            chunkIndex: Math.floor(i / chunkSize),
            totalChunks: totalChunksEstimate,
            sourceType: 'google_drive',
            fileId: fileId,
            mimeType: mimeType
          }
        });
      }
    }

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: `No meaningful content found in file: ${fileName}` },
        { status: 400 }
      );
    }

    console.log(`Split into ${chunks.length} chunks`);

    // Generate embeddings for each chunk
    const embeddings = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        console.log(`Generating embedding for chunk ${i + 1}/${chunks.length}`);
        const embedding = await generateEmbedding(chunk.text);
        embeddings.push(embedding);
      } catch (error) {
        console.error(`Error generating embedding for chunk ${i}:`, error);
        // Continue with other chunks even if one fails
        embeddings.push(null);
      }
    }

    // Filter out failed embeddings
    const validChunks = [];
    const validEmbeddings = [];
    for (let i = 0; i < chunks.length; i++) {
      if (embeddings[i] !== null) {
        validChunks.push(chunks[i]);
        validEmbeddings.push(embeddings[i]);
      }
    }

    if (validEmbeddings.length === 0) {
      return NextResponse.json(
        { error: `Failed to generate embeddings for file: ${fileName}` },
        { status: 500 }
      );
    }

    // Store chunks and embeddings in Pinecone
    try {
      console.log(`Storing ${validEmbeddings.length} vectors in Pinecone...`);
      await storeDocumentChunks(validChunks, validEmbeddings);
      console.log(`Successfully stored ${validEmbeddings.length} document chunks in Pinecone`);
    } catch (error) {
      console.error('Error storing vectors in Pinecone:', error);
      return NextResponse.json(
        { error: `Failed to store document in knowledge base: ${fileName}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${fileName}`,
      chunksProcessed: validEmbeddings.length,
      fileName: fileName,
      fileId: fileId
    });

  } catch (error) {
    console.error('Error processing Google Drive file:', error);
    return NextResponse.json(
      { error: 'Failed to process Google Drive file' },
      { status: 500 }
    );
  }
}
