'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to launching soon page
    router.replace('/launching-soon');
  }, [router]);

  // Show a minimal loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-base">
      <div className="animate-pulse text-text-tertiary">Loading...</div>
    </div>
  );
}
