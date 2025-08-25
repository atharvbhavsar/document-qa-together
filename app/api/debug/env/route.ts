import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    env: {
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      NEXT_PUBLIC_GOOGLE_REDIRECT_URI: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
      USE_OLLAMA: process.env.USE_OLLAMA,
      OLLAMA_HOST: process.env.OLLAMA_HOST,
      NODE_ENV: process.env.NODE_ENV,
    },
    allGoogleVars: Object.keys(process.env).filter(key => key.includes('GOOGLE')),
    hasEnvLocal: process.env.NODE_ENV === 'development'
  });
}
