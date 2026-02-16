'use client';

import { useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

export default function Home() {
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log('SESSION:', data.session);
    };
    checkSession();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-3xl font-bold">Smart Bookmark App</h1>
      <p className="text-sm text-gray-600">
        Sign in to manage your personal bookmarks.
      </p>
      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Sign in with Google
      </button>
    </main>
  );
}


