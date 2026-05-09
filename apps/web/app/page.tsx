'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_URL, setToken } from '../lib/api';

export default function InvitePage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      const accessToken = localStorage.getItem('access_token');

      // 🔐 se non loggato → redirect login
      if (!accessToken) {
        router.push(`/login?next=/invite?token=${token}`);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/invitations/accept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          throw new Error('Accept failed');
        }

        const data = await res.json();

        // 🔄 nuovo JWT con nuova associazione
        setToken(data.access_token);

        setStatus('success');

        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };

    run();
  }, [token]);

  return (
    <main className="p-10">
      {status === 'loading' && <p>Joining association...</p>}
      {status === 'success' && <p>Welcome 🎉 Redirecting...</p>}
      {status === 'error' && <p>Invalid or expired invitation</p>}
    </main>
  );
}