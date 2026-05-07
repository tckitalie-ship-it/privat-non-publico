'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
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

      try {
        const response = await fetch('/api/invitations/accept', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Errore');
        }

        setMessage('Invito accettato con successo ✅');
      } catch (err) {
        setError(true);

        if (err instanceof Error) {
          setMessage(err.message);
        } else {
          setMessage('Errore sconosciuto');
        }
      }
    }

    acceptInvite();
  }, [token]);

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