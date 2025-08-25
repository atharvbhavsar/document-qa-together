'use client';

import { useState, useEffect } from 'react';
import InfoAlert from './InfoAlert';

interface NotificationProps {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export default function Notification({ message, type, duration = 3000 }: NotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <InfoAlert
        title=""
        message={message}
        type={type}
        onDismiss={() => setVisible(false)}
      />
    </div>
  );
}
