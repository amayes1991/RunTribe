'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ChallengesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    // Redirect to dashboard since challenges feature is temporarily hidden
    router.push('/dashboard');
  }, [session, status, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="text-white">Redirecting...</div>
    </div>
  );
}