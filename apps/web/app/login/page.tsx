'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { API_URL, setAccessToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);

      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(loginData.message || 'Login fallito');
      }

      setAccessToken(loginData.access_token);

      const associationId = loginData.association?.id;

      if (associationId) {
        const switchRes = await fetch(
          `${API_URL}/auth/switch-association`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${loginData.access_token}`,
            },
            body: JSON.stringify({
              associationId,
            }),
          },
        );

        const switchData = await switchRes.json();

        if (switchRes.ok && switchData.access_token) {
          setAccessToken(switchData.access_token);
        }
      }

      router.replace('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Login fallito');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f1117] p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-2xl">
        <h1 className="text-4xl font-bold">
          Accedi
        </h1>

        <p className="mt-2 text-gray-400">
          Entra nella piattaforma associazioni
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="text-sm text-gray-400">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 outline-none focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading ? 'Accesso...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
}