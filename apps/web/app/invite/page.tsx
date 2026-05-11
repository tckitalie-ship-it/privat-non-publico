'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  API_URL,
  getAccessToken,
  setAccessToken,
} from '@/lib/api';

export default function InvitePage() {
  const router = useRouter();
  const params = useSearchParams();

  const token = params.get('token');

  const [status, setStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');

  const [message, setMessage] = useState('');

  useEffect(() => {
    async function acceptInvite() {
      try {
        if (!token) {
          throw new Error('Token invito mancante');
        }

        const accessToken = getAccessToken();

        if (!accessToken) {
          router.push('/login');
          return;
        }

        const res = await fetch(
          `${API_URL}/api/invitations/accept`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              token,
            }),
          },
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || 'Errore accettazione invito',
          );
        }

        setAccessToken(data.access_token);

        setStatus('success');

        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (err: any) {
        setStatus('error');
        setMessage(
          err.message || 'Errore accettazione invito',
        );
      }
    }

    acceptInvite();
  }, [router, token]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white shadow rounded-xl p-6 w-full max-w-md text-center">
        {status === 'loading' && (
          <p>Accettazione invito...</p>
        )}

        {status === 'success' && (
          <p className="text-green-600 font-medium">
            Invito accettato ✅
          </p>
        )}

        {status === 'error' && (
          <div className="space-y-2">
            <p className="text-red-600 font-medium">
              Errore
            </p>

            <p className="text-sm text-gray-600">
              {message}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}