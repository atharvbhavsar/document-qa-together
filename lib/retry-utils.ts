'use client';

/**
 * Utility function for retrying API calls with exponential backoff
 * 
 * @param fn The async function to retry
 * @param maxRetries Maximum number of retry attempts
 * @param isRetryable Function to determine if the error is retryable
 * @param onRetry Optional callback that fires when a retry happens
 * @returns Result of the async function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  isRetryable: (error: any) => boolean = () => true,
  onRetry?: (attempt: number, delay: number) => void
): Promise<T> {
  let retryCount = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      retryCount++;
      
      // Stop if we've hit max retries or the error isn't retryable
      if (retryCount >= maxRetries || !isRetryable(error)) {
        throw error;
      }
      
      // Calculate exponential backoff with jitter
      // Base: 1000ms, 2000ms, 4000ms, etc.
      // Add jitter (random variation) to prevent thundering herd problem
      const baseDelay = Math.pow(2, retryCount - 1) * 1000;
      const jitter = Math.random() * 500; // Random value between 0-500ms
      const delay = baseDelay + jitter;
      
      // Call the onRetry callback if provided
      if (onRetry) {
        onRetry(retryCount, delay);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Helper for determining if an error is related to API rate limiting
 */
export function isRateLimitError(error: any): boolean {
  if (!error) return false;
  
  // Check common rate limit error patterns
  if (error.message) {
    return (
      error.message.includes('Quota exceeded') ||
      error.message.includes('rate limit') || 
      error.message.includes('Too Many Requests') ||
      error.message.includes('429')
    );
  }
  
  // Check status code if available
  if (error.status === 429 || error.statusCode === 429) {
    return true;
  }
  
  return false;
}
