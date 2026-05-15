'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

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

  function handleLogout() {
    localStorage.clear();
    router.push('/login');
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-white/10 bg-[#111827] px-5 py-6 text-white lg:flex">
      <div className="mb-10">
        <h2 className="text-2xl font-bold">Association</h2>
        <p className="mt-1 text-sm text-gray-400">SaaS Platform</p>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
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
  );
}