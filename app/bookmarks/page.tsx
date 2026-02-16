'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

type Bookmark = {
  id: string;
  url: string;
  title: string | null;
  created_at: string;
};

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.replace('/');
        return;
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setBookmarks(data || []);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace('/');
      return;
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        url,
        title: title || null,
        user_id: session.user.id,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setBookmarks((prev) => [data as Bookmark, ...prev]);
    setUrl('');
    setTitle('');
  };

  const handleDelete = async (id: string) => {
    setError(null);

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
      return;
    }

    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading bookmarks...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-xl mx-auto p-4 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Bookmarks</h1>
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          Logout
        </button>
      </header>

      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-2 border p-3 rounded bg-white"
      >
        <input
          type="url"
          required
          placeholder="Bookmark URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="text"
          placeholder="Optional title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button
          type="submit"
          className="self-start px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Add bookmark
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="flex flex-col gap-2">
        {bookmarks.length === 0 && (
          <p className="text-sm text-gray-600">
            No bookmarks yet. Add one above.
          </p>
        )}

        {bookmarks.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between border rounded px-3 py-2 bg-white"
          >
            <div className="flex flex-col">
              <a
                href={b.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline break-all"
              >
                {b.title || b.url}
              </a>
              <span className="text-xs text-gray-500">
                {new Date(b.created_at).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => handleDelete(b.id)}
              className="ml-3 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
