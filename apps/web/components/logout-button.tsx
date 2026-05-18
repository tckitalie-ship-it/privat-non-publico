'use client';

import { useRouter } from 'next/navigation';

import {
  clearAccessToken,
} from '@/lib/api';

import {
  disconnectSocket,
} from '@/lib/socket';

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    clearAccessToken();

    disconnectSocket();

    router.replace('/login');
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-xl border border-red-500/30 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
    >
      Logout
    </button>
  );
}