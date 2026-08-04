'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [message, setMessage] = useState('Accettazione invito...');
  const [error, setError] = useState(false);

  useEffect(() => {
    async function acceptInvite() {
      if (!token) {
        setError(true);
        setMessage('Token mancante');
        return;
      }

      const authToken = localStorage.getItem('access_token');

      if (!authToken) {
        setError(true);
        setMessage('No auth token. Fai login prima di accettare l’invito.');
        return;
      }

      try {
        const response = await fetch('/api/invitations/accept', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ token }),
        });

        const text = await response.text();

        let data: unknown = {};

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(text || 'Risposta non valida');
        }

        // -----------------------------
        // 🔥 BLOCCO CORRETTO E CHIUSO
        // -----------------------------
        if (!response.ok) {
          let msg = 'Errore';

          if (
            typeof data === 'object' &&
            data !== null &&
            'message' in data
          ) {
            const value = data as { message?: unknown };

            if (typeof value.message === 'string') {
              msg = value.message;
            }
          }

          throw new Error(msg);
        }

        // 🔥 SUCCESSO — fuori dall'if
        setMessage('Invito accettato con successo ✅');

        // 🔥 Redirect dopo 1 secondo
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);

      } catch (err: unknown) {
        setError(true);

        if (err instanceof Error) {
          setMessage(err.message);
        } else {
          setMessage('Errore accettazione invito');
        }
      }
    }

    acceptInvite();
  }, [token, router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="border rounded-xl p-8 shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">
          {error ? 'Errore' : 'Invito'}
        </h1>

        <p>{message}</p>
      </div>
    </main>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
