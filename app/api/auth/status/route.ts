'use server';

import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('google_access_token');
  const refreshToken = cookieStore.get('google_refresh_token');
  
  return Response.json({
    isAuthenticated: !!accessToken,
    hasRefreshToken: !!refreshToken,
  });
}
