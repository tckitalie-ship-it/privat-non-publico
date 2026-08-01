'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { API_URL, getAccessToken } from '@/lib/api';

type GuestGuardProps = {
  children: ReactNode;
};

export default function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkGuest() {
      const token = getAccessToken();

      if (!token) {
        setChecking(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          router.replace('/dashboard');
          return;
        }

        setChecking(false);
      } catch {
        setChecking(false);
      }
    }

    checkGuest();
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f1117] text-white">
        <p className="text-gray-400">Verifica sessione...</p>
      </main>
    );
  }

  return <>{children}</>;
}