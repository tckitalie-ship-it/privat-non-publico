'use client';

import { useRouter } from 'next/navigation';
import { clearAccessToken } from '@/lib/api';

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    clearAccessToken();

    document.cookie =
      'access_token=; path=/; max-age=0';

    router.replace('/login');
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5"
    >
      Logout
    </button>
  );
}