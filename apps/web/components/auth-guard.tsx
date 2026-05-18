'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { API_URL, clearAccessToken, getAccessToken } from '@/lib/api';

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = getAccessToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          clearAccessToken();
          router.replace('/login');
          return;
        }

        setChecking(false);
      } catch {
        clearAccessToken();
        router.replace('/login');
      }
    }

    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f1117] text-white">
        <div className="rounded-3xl border border-white/10 bg-[#111827] px-8 py-6 shadow-2xl">
          <p className="text-gray-300">Verifica sessione...</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}