'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, setToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const params = useSearchParams();
const next = params.get('next');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const data = await login(email, password);
      setToken(data.access_token);
      router.push(next || '/dashboard');
} catch (err) {
  setError(err instanceof Error ? err.message : 'Errore sconosciuto');
}
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded-xl p-6">
        <h1 className="text-2xl font-bold">Login</h1>

        <input
          className="w-full border rounded p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />

        <input
          className="w-full border rounded p-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button className="w-full bg-black text-white rounded p-2">
          Accedi
        </button>
      </form>
    </main>
  );
}