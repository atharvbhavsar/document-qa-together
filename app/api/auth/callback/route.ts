import { NextRequest, NextResponse } from 'next/server';
import GoogleDriveService from '@/lib/google-drive';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?auth=error&error=${error}`);
      return response;
    }

    if (!code) {
      console.error('No authorization code provided');
      const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?auth=error&error=no_code`);
      return response;
    }

    // Try to authenticate with Google Drive
    const driveService = new GoogleDriveService();
    const tokens = await driveService.setCredentials(code);

    // Store tokens in secure HTTP-only cookies
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?auth=success`);
    
    // Set secure cookies with tokens
    response.cookies.set('google_access_token', tokens.access_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    });
    
    if (tokens.refresh_token) {
      response.cookies.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }

    return response;

  } catch (error) {
    console.error('Error during Google Drive callback:', error);
    
    // Check if it's an invalid_grant error (code already used)
    if (error instanceof Error && error.message.includes('invalid_grant')) {
      console.error('Authorization code already used or expired');
      const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?auth=error&error=invalid_grant`);
      return response;
    }
    
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?auth=error&error=auth_failed`);
    return response;
  }
}
