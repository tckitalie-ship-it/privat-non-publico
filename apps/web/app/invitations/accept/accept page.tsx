'use client';

import { useEffect } from 'react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import { API_URL, getAccessToken } from '@/lib/api';

export default function AcceptInvitationPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  useEffect(() => {
    async function acceptInvitation() {
      const invitationToken =
        searchParams.get('token');

      if (!invitationToken) {
        alert('Token invito mancante');

        router.replace('/dashboard');

        return;
      }

      const accessToken =
        getAccessToken();

      if (!accessToken) {
        alert(
          'Effettua login prima di accettare invito',
        );

        router.replace('/login');

        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/invitations/accept`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Authorization: `Bearer ${accessToken}`,
            },

            body: JSON.stringify({
              token:
                invitationToken,
            }),
          },
        );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
              'Errore accettazione invito',
          );
        }

        alert(
          'Invito accettato',
        );

        router.replace(
          '/dashboard',
        );
      } catch (error) {
        console.error(error);

        alert(
          'Errore accettazione invito',
        );

        router.replace(
          '/dashboard',
        );
      }
    }

    acceptInvitation();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f1117] text-white">
      <div className="rounded-3xl border border-white/10 bg-[#111827] px-8 py-6 shadow-2xl">
        <h1 className="text-2xl font-bold">
          Accettazione invito...
        </h1>

        <p className="mt-2 text-gray-400">
          Attendere prego
        </p>
      </div>
    </main>
  );
}