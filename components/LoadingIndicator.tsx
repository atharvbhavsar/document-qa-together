'use client';
import { useState, useEffect } from 'react';

interface LoadingIndicatorProps {
  isVisible: boolean;
  message?: string;
  showRetryInfo?: boolean;
}

export default function LoadingIndicator({
  isVisible,
  message = 'Processing your request...',
  showRetryInfo = false
}: LoadingIndicatorProps) {
  const [dots, setDots] = useState('');
  const [showRetryMessage, setShowRetryMessage] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Animate the dots
  useEffect(() => {
    if (!isVisible) {
      setElapsedTime(0);
      setShowRetryMessage(false);
      return;
    }

    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    // Track elapsed time
    const timeInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      
      // Show retry message after 5 seconds
      if (elapsedTime > 5 && showRetryInfo) {
        setShowRetryMessage(true);
      }
    }, 1000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(timeInterval);
    };
  }, [isVisible, elapsedTime, showRetryInfo]);

  if (!isVisible) return null;

  return (
    <div className="bg-gray-100 rounded-lg p-3 sm:p-4 flex flex-col space-y-2 mx-2 sm:mx-0">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {message}<span className="inline-block w-6 sm:w-8">{dots}</span>
        </p>
      </div>
      
      {showRetryMessage && (
        <p className="text-xs text-gray-500 italic leading-relaxed">
          This may take a moment. If the AI service is busy, we'll automatically retry.
        </p>
      )}
    </div>
  );
}
