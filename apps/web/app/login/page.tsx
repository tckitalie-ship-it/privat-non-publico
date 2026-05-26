'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('12345678');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Email o password non validi');
      }

      const data = await res.json();

      const token = data.access_token || data.accessToken || data.token;

      if (!token) {
        throw new Error('Token non ricevuto dal server');
      }

      localStorage.setItem('access_token', token);

      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090D14] px-6 text-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl"
      >
        <p className="text-sm text-zinc-500">Bentornato</p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Accedi
        </h1>

        <p className="mt-3 text-sm text-zinc-400">
          Entra nella dashboard della tua associazione.
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="text-sm text-zinc-400">
              Email
            </label>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30"
              placeholder="test@example.com"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">
              Password
            </label>

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full rounded-2xl bg-white px-5 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Accesso...' : 'Accedi'}
        </button>
      </form>
    </main>
  );
}
