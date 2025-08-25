// lib/session-utils.ts
// Utility for managing session information

/**
 * Generates a unique session ID for the current browser session
 */
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Get the current session ID or create a new one
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return generateSessionId(); // For server-side rendering
  }
  
  let sessionId = sessionStorage.getItem('documentQA_sessionId');
  
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('documentQA_sessionId', sessionId);
  }
  
  return sessionId;
}

/**
 * Check if the current session ID matches the provided one
 */
export function isCurrentSession(sessionId: string): boolean {
  if (typeof window === 'undefined') {
    return false; // For server-side rendering
  }
  
  const currentSessionId = sessionStorage.getItem('documentQA_sessionId');
  return currentSessionId === sessionId;
}

/**
 * Reset the current session
 */
export function resetSession(): string {
  const newSessionId = generateSessionId();
  
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('documentQA_sessionId', newSessionId);
  }
  
  return newSessionId;
}
