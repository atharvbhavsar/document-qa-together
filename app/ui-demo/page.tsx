'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UIDemoRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to search page since UI demo has been removed
    router.replace('/search');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to Search Documents...</h1>
        <p className="text-gray-600">The UI demo has been moved. You'll be redirected to Search Documents.</p>
      </div>
    </div>
  );
}
