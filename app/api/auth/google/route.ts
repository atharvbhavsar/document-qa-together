import { NextRequest, NextResponse } from 'next/server';
import GoogleDriveService from '@/lib/google-drive';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Starting Google Auth URL generation...');
    console.log('🔑 Client ID exists:', !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    console.log('🔑 Client Secret exists:', !!process.env.GOOGLE_CLIENT_SECRET);
    console.log('🔗 Redirect URI:', process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI);
    
    const driveService = new GoogleDriveService();
    const authUrl = driveService.getAuthUrl();
    
    console.log('✅ Auth URL generated successfully:', authUrl);
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('❌ Error generating auth URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate authentication URL', details: errorMessage },
      { status: 500 }
    );
  }
}
