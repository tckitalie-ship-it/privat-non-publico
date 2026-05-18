'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from '@/components/theme-toggle';

import { API_URL, clearAccessToken, getAccessToken } from '@/lib/api';
import { disconnectSocket } from '@/lib/socket';

type Association = {
  id: string;
  name: string;
  logoUrl?: string | null;
};

const navItems = [
  { label: 'Cruscotto', href: '/dashboard', icon: '🏠' },
  { label: 'Eventi', href: '/events', icon: '🗓️' },
  { label: 'Finanze', href: '/finance', icon: '💰' },
  { label: 'Membri', href: '/members', icon: '👥' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [association, setAssociation] = useState<Association | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function loadAssociation() {
      const token = getAccessToken();

      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/associations/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        setAssociation(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadAssociation();
  }, []);

  function handleLogout() {
    clearAccessToken();
    disconnectSocket();
    router.replace('/login');
  }

  const associationName = association?.name || 'Association';

  const initials = associationName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  function Brand() {
    return (
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a]">
          {association?.logoUrl ? (
            <img
              src={association.logoUrl}
              alt={associationName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lg font-bold text-white">{initials}</span>
          )}
        </div>

        <div>
          <h2 className="line-clamp-1 text-lg font-bold">
            {associationName}
          </h2>
          <p className="text-sm text-gray-400">SaaS Platform</p>
        </div>
      </div>
    );
  }

  function NavLinks() {
    return (
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-4 rounded-2xl px-4 py-4 text-base font-semibold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#111827]/95 px-4 py-4 text-white backdrop-blur lg:hidden">
        <Brand />

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/5"
        >
          {mobileOpen ? 'Chiudi' : 'Menu'}
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 lg:hidden">
          <div className="h-full w-80 max-w-[85vw] border-r border-white/10 bg-[#111827] p-5 text-white shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <Brand />

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm transition hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <NavLinks />
            <div className="mt-4">
  <ThemeToggle />
</div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 w-full rounded-2xl border border-red-500/30 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-white/10 bg-[#111827] px-5 py-6 text-white lg:flex">
        <div className="mb-10">
          <Brand />
        </div>

        <div className="flex flex-1 flex-col">
          <NavLinks />
        </div>

        <div className="mt-6 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-400 p-5 shadow-xl">
          <p className="text-sm font-medium text-white/80">Piano attuale</p>
          <h3 className="mt-2 text-2xl font-bold">Starter</h3>
          <p className="mt-2 text-sm text-white/80">
            Sblocca analytics avanzate, automazioni e utenti illimitati.
          </p>

          <button
            type="button"
            onClick={() => router.push('/billing')}
            className="mt-5 w-full rounded-2xl bg-[#111827] px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/40"
          >
            Upgrade Pro
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5 hover:text-white"
        >
          Logout
        </button>
      </aside>
    </>
  );
}