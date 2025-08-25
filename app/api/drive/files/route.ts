import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import GoogleDriveService from '@/lib/google-drive';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('google_access_token');
    const refreshToken = cookieStore.get('google_refresh_token');

    console.log('🔍 Drive files API - Checking authentication...');
    console.log('Access token exists:', !!accessToken);
    console.log('Refresh token exists:', !!refreshToken);

    if (!accessToken) {
      console.log('❌ No access token found in cookies');
      return NextResponse.json(
        { error: 'Google Drive authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get('maxResults') || '50');
    const searchQuery = searchParams.get('query') || '';

    console.log('📂 Fetching Google Drive files...');
    console.log('Max results:', maxResults);
    console.log('Search query:', searchQuery);

    // Set up Google Drive service with tokens from cookies
    const driveService = new GoogleDriveService();
    const tokens = {
      access_token: accessToken.value,
      refresh_token: refreshToken?.value
    };
    
    console.log('🔑 Setting up Drive service with tokens...');
    driveService.setTokens(tokens);

    // Get files from Google Drive
    console.log('📋 Calling listFiles...');
    const result = await driveService.listFiles(undefined, maxResults, searchQuery);
    
    console.log('✅ Successfully retrieved files:', result.files?.length || 0);

    return NextResponse.json({ 
      success: true, 
      files: result.files || [],
      count: result.files?.length || 0
    });

  } catch (error) {
    console.error('❌ Error listing Google Drive files:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to list Google Drive files';
    
    if (error instanceof Error) {
      if (error.message.includes('invalid_grant') || error.message.includes('unauthorized')) {
        errorMessage = 'Google Drive access token has expired. Please sign in again.';
      } else if (error.message.includes('forbidden')) {
        errorMessage = 'Access to Google Drive is forbidden. Please check your permissions.';
      } else if (error.message.includes('quota')) {
        errorMessage = 'Google Drive API quota exceeded. Please try again later.';
      } else {
        errorMessage = `Google Drive error: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
