import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || 'llama3:latest';

export async function GET() {
  try {
    console.log('Testing Ollama connection...');
    console.log('OLLAMA_HOST:', OLLAMA_HOST);
    console.log('OLLAMA_CHAT_MODEL:', OLLAMA_CHAT_MODEL);
    console.log('Raw env OLLAMA_CHAT_MODEL:', process.env.OLLAMA_CHAT_MODEL);
    console.log('Raw env OLLAMA_HOST:', process.env.OLLAMA_HOST);
    console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('OLLAMA')));
    
    // Test basic connectivity
    const tagsResponse = await fetch(`${OLLAMA_HOST}/api/tags`);
    
    if (!tagsResponse.ok) {
      return NextResponse.json({
        error: 'Failed to connect to Ollama',
        status: tagsResponse.status,
        statusText: tagsResponse.statusText,
        host: OLLAMA_HOST
      }, { status: 500 });
    }
    
    const tags = await tagsResponse.json();
    
    // Test chat generation
    const generateResponse = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_CHAT_MODEL,
        prompt: 'Hello, this is a test. Please respond with "Test successful!"',
        stream: false,
      }),
    });

    if (!generateResponse.ok) {
      return NextResponse.json({
        error: 'Failed to generate response',
        status: generateResponse.status,
        statusText: generateResponse.statusText,
        host: OLLAMA_HOST,
        model: OLLAMA_CHAT_MODEL,
        tagsSuccess: true,
        availableModels: tags.models
      }, { status: 500 });
    }

    const generateResult = await generateResponse.json();

    return NextResponse.json({
      success: true,
      host: OLLAMA_HOST,
      model: OLLAMA_CHAT_MODEL,
      availableModels: tags.models,
      testResponse: generateResult.response,
      fullResult: generateResult
    });

  } catch (error: any) {
    console.error('Ollama test error:', error);
    return NextResponse.json({
      error: 'Connection error',
      message: error.message,
      host: OLLAMA_HOST,
      model: OLLAMA_CHAT_MODEL
    }, { status: 500 });
  }
}
