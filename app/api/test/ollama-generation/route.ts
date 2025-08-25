import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Dynamically import to avoid issues with Next.js
    const { generateOllamaResponse } = await import('@/lib/ollama-config');
    
    // Test text generation
    const response = await generateOllamaResponse('Say hello and introduce yourself briefly');
    
    return NextResponse.json({
      success: true,
      message: 'Text generated successfully',
      response: response
    });
  } catch (error: any) {
    console.error('Error testing Ollama generation:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate text with Ollama' 
    }, { status: 500 });
  }
}
