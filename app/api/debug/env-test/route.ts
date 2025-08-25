import { NextRequest, NextResponse } from 'next/server';

// Try to require dotenv explicitly
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  console.log('Dotenv not available or failed to load:', e);
}

export async function GET(request: NextRequest) {
  const envVars = [
    'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'NEXT_PUBLIC_GOOGLE_REDIRECT_URI',
    'GOOGLE_API_KEY',
    'PINECONE_API_KEY',
    'USE_OLLAMA',
    'OLLAMA_HOST',
    'OLLAMA_CHAT_MODEL'
  ];

  const envCheck: any = {};
  
  for (const envVar of envVars) {
    envCheck[envVar] = {
      exists: !!process.env[envVar],
      value: process.env[envVar] || 'undefined',
      length: process.env[envVar]?.length || 0,
      first10: process.env[envVar]?.substring(0, 10) || 'undefined'
    };
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    nextjsVersion: process.env.NEXT_RUNTIME,
    env_check: envCheck,
    all_env_keys: Object.keys(process.env).filter(key => 
      key.startsWith('GOOGLE') || 
      key.startsWith('PINECONE') || 
      key.startsWith('NEXT_PUBLIC') ||
      key.startsWith('USE_OLLAMA') ||
      key.startsWith('OLLAMA') ||
      key.startsWith('APP_') ||
      key.startsWith('JWT_')
    ),
    total_env_vars: Object.keys(process.env).length,
    cwd: process.cwd()
  });
}
