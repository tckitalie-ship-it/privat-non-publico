'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_URL, setAccessToken } from '@/lib/api';

function InviteContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function run() {
      if (!token) {
        setStatus('error');
        setMessage('Token invito mancante');
        return;
      }

      const accessToken = localStorage.getItem('access_token');

      if (!accessToken) {
        router.push(`/login?next=/invite?token=${token}`);
        return;
      }

      try {
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
          throw new Error(data.message || 'Invito non valido o scaduto');
        }

        if (!data.access_token) {
          throw new Error('Token mancante nella risposta');
        }

        setAccessToken(data.access_token);
        setStatus('success');
        setMessage('Invito accettato. Reindirizzamento...');

        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Errore accettazione invito');
      }
    }

    run();
  }, [token, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white shadow rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">Accetta invito</h1>

        {status === 'loading' && (
          <p className="text-gray-500">Accettazione invito...</p>
        )}

        {message && (
          <div className="border bg-gray-50 text-sm rounded p-3">
            {message}
          </div>
        )}

        {status === 'error' && (
          <button
            onClick={() => router.push('/login')}
            className="w-full border rounded py-2"
          >
            Vai al login
          </button>
        )}
      </div>
    </main>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InviteContent />
    </Suspense>
  );
}