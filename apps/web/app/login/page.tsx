'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  API_URL,
  setAccessToken,
} from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      console.log('API_URL:', API_URL);

      const res = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || 'Login fallito',
        );
      }

      if (!data.access_token) {
        throw new Error(
          'Token mancante nella risposta login',
        );
      }

      setAccessToken(data.access_token);

      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);

      setError(
        err.message || 'Login fallito',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white shadow rounded-xl p-6 space-y-4"
      >
        <div>
          <h1 className="text-2xl font-bold">
            Login
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Accedi alla piattaforma
          </p>
        </div>

        {error && (
          <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded p-3">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm text-gray-600">
            Email
          </label>

          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">
            Password
          </label>

          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
        >
          {loading
            ? 'Accesso...'
            : 'Accedi'}
        </button>
      </form>
    </main>
  );
}