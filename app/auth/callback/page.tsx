'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Let Supabase parse the URL hash and update the session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        router.replace('/?error=auth');
        return;
      }

      if (!data.session) {
        // No session yet: just go home or stay here briefly
        router.replace('/');
        return;
      }

      // Session exists: go to bookmarks
      router.replace('/bookmarks');
    };

    handleCallback();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p>Finishing sign-in...</p>
    </main>
  );
}

