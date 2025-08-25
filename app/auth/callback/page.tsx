'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const authStatus = searchParams.get('auth');
    const error = searchParams.get('error');

    if (authStatus === 'success') {
      setStatus('success');
      // Notify parent window if opened as popup
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_SUCCESS'
        }, window.location.origin);
        window.close();
      } else {
        // Redirect to main page after success
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } else if (authStatus === 'error') {
      setStatus('error');
      let message = 'Authentication failed';
      
      switch (error) {
        case 'access_denied':
          message = 'You cancelled the authorization. Please try again and grant the necessary permissions to access your Google Drive.';
          break;
        case 'restricted_client':
          message = 'This application is currently in testing mode. Your email needs to be added to the test users list, or you need to wait for the app to be published for public use.';
          break;
        case 'invalid_client':
          message = 'Invalid client configuration. Please contact the administrator.';
          break;
        case 'invalid_grant':
          message = 'Authorization code has expired or was already used. Please try again.';
          break;
        case 'no_code':
          message = 'No authorization code received from Google.';
          break;
        case 'auth_failed':
          message = 'Failed to authenticate with Google Drive.';
          break;
        default:
          message = `Authentication error: ${error || 'Unknown error'}`;
      }
      
      setErrorMessage(message);
      
      // Notify parent window if opened as popup
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: message
        }, window.location.origin);
        window.close();
      }
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: message
        }, window.location.origin);
        setTimeout(() => {
          window.close();
        }, 3000);
      } else {
        // Redirect to main page after showing error
        setTimeout(() => {
          router.push('/');
        }, 5000);
      }
    } else {
      // This shouldn't happen with our new flow, but handle just in case
      const code = searchParams.get('code');
      const oauthError = searchParams.get('error');

      if (oauthError) {
        setStatus('error');
        setErrorMessage(`OAuth error: ${oauthError}`);
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: oauthError
          }, window.location.origin);
          setTimeout(() => window.close(), 3000);
        }
      } else if (code) {
        // Redirect to API route to handle the OAuth flow
        window.location.href = `/api/auth/callback${window.location.search}`;
      } else {
        setStatus('error');
        setErrorMessage('No authorization code received');
      }
    }
  }, [searchParams, router]);

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-green-500 text-4xl mb-4">✓</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Authentication Successful!
          </h2>
          <p className="text-gray-600">
            Google Drive authentication completed successfully. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 text-4xl mb-4">✗</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mb-4">
            {errorMessage}
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Completing Authentication
        </h2>
        <p className="text-gray-600">
          Please wait while we complete your Google Drive authentication...
        </p>
      </div>
    </div>
  );
}
