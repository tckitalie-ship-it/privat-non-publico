'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  AuthUser,
  getCurrentUser,
} from '@/lib/auth';

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles: ('OWNER' | 'ADMIN' | 'MEMBER')[];
};

export default function RoleGuard({
  children,
  allowedRoles,
}: RoleGuardProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkRole() {
      const user: AuthUser | null =
        await getCurrentUser();

      if (!user?.role) {
        router.replace('/login');
        return;
      }

      if (!allowedRoles.includes(user.role as any)) {
        router.replace('/dashboard');
        return;
      }

      setAuthorized(true);
      setLoading(false);
    }

    checkRole();
  }, [allowedRoles, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f1117] text-white">
        <p className="text-gray-400">
          Verifica permessi...
        </p>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}