'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Membri', href: '/members' },
  { label: 'Eventi', href: '/events' },
  { label: 'Finanze', href: '/finance' },
  { label: 'Settings', href: '/settings' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('jwt');
    window.location.href = '/login';
  }

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-white/10 bg-[#070B12] p-5 text-white lg:block">
      <div className="mb-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-bold">
          SA
        </div>

        <h2 className="mt-4 text-lg font-semibold tracking-tight">
          SaaS Admin
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Association Platform
        </p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? 'bg-white text-zinc-950'
                  : 'text-zinc-400 hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Piano
        </p>

        <h3 className="mt-2 text-lg font-semibold">
          Starter
        </h3>

        <p className="mt-2 text-sm leading-5 text-zinc-400">
          Sblocca analytics, automazioni e utenti illimitati.
        </p>

        <button className="mt-4 w-full rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950">
          Upgrade
        </button>
      </div>

      <button
        onClick={logout}
        className="mt-6 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
      >
        Logout
      </button>
    </aside>
  );
}