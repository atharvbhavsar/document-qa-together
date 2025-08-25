import { NextRequest, NextResponse } from 'next/server';
import DriveRAGPipeline from '@/lib/drive-rag';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokens, question } = body;

    if (!tokens) {
      return NextResponse.json(
        { error: 'Google Drive authentication tokens required' },
        { status: 401 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const pipeline = new DriveRAGPipeline();
    pipeline.setDriveCredentials(tokens);

    const answer = await pipeline.answerQuestion(question);

    return NextResponse.json({ 
      success: true, 
      answer,
      question
    });

  } catch (error) {
    console.error('Error answering question from Google Drive:', error);
    return NextResponse.json(
      { error: 'Failed to answer question using Google Drive documents' },
      { status: 500 }
    );
  }
}
