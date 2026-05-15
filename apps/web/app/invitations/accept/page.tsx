'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { API_URL, getAccessToken, setAccessToken } from '@/lib/api';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);

  async function acceptInvitation() {
    if (!token) {
      toast.error('Token invito mancante');
      return;
    }

    const accessToken = getAccessToken();

    if (!accessToken) {
      localStorage.setItem('pending_invitation_token', token);
      toast.error('Fai login prima di accettare l’invito');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/invitations/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore accettazione invito');
      }

      if (data.access_token) {
        setAccessToken(data.access_token);
      }

      localStorage.removeItem('pending_invitation_token');

      toast.success('Invito accettato');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Errore accettazione invito');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f1117] p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-2xl">
        <h1 className="text-3xl font-bold">Accetta invito</h1>

        {!token ? (
          <>
            <p className="mt-3 text-gray-400">Token invito mancante.</p>

            <button
              onClick={() => router.push('/login')}
              className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500"
            >
              Vai al login
            </button>
          </>
        ) : (
          <>
            <p className="mt-3 text-gray-400">
              Conferma per entrare nell’associazione.
            </p>

            <button
              onClick={acceptInvitation}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading ? 'Accettazione...' : 'Accetta invito'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}