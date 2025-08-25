import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Dynamically import to avoid issues with Next.js
    const { generateOllamaEmbedding } = await import('@/lib/ollama-config');
    
    // Test embedding generation
    const embedding = await generateOllamaEmbedding('This is a test of Ollama embeddings');
    
    return NextResponse.json({
      success: true,
      message: 'Embedding generated successfully',
      dimension: embedding.length,
      sample: embedding.slice(0, 5) // Just show the first few values
    });
  } catch (error: any) {
    console.error('Error testing Ollama embedding:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate embedding with Ollama' 
    }, { status: 500 });
  }
}
