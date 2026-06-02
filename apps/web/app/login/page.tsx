'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAccessToken } from '@/lib/api';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api-production-0f62.up.railway.app';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('nuovo@example.com');
  const [password, setPassword] = useState('12345678');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Login fallito');
      }

      const data = await res.json();

      if (!data.access_token) {
        throw new Error('Token mancante');
      }

      setAccessToken(data.access_token);
      router.push('/dashboard');
    } catch {
      setError('Email o password non validi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-white p-8 shadow-xl">
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            NPA
          </p>

          <h1 className="text-2xl font-bold text-slate-900">
            News Platform Association
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Accedi alla piattaforma di gestione della tua associazione.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nuovo@example.com"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="12345678"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Accesso...' : 'Entra'}
          </button>
        </form>
      </div>
    </main>
  );
}