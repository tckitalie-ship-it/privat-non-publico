'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const items = [
  {
    href: '/dashboard',
    label: 'Cruscotto',
    icon: '🏠',
  },
  {
    href: '/events',
    label: 'Eventi',
    icon: '📅',
  },
  {
    href: '/finance',
    label: 'Finanze',
    icon: '💰',
  },
  {
    href: '/members',
    label: 'Membri',
    icon: '👥',
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: '⚙️',
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          fixed left-4 top-4 z-50
          rounded-xl
          bg-[#111827]
          px-4 py-3
          text-white
          shadow-xl
          lg:hidden
        "
      >
        ☰
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-72 flex-col
          border-r border-white/5
          bg-[#0f1117]
          text-white
          transition-transform duration-300

          ${open ? 'translate-x-0' : '-translate-x-full'}

          lg:translate-x-0
        `}
      >
        <div className="flex items-center justify-between border-b border-white/5 p-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Association
            </h2>

            <p className="text-sm text-gray-400">
              SaaS Platform
            </p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="lg:hidden"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <nav className="space-y-3">
            {items.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-4
                    rounded-2xl px-5 py-4
                    text-lg font-medium
                    transition-all duration-200

                    ${
                      active
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <span className="text-2xl">
                    {item.icon}
                  </span>

                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/5 p-5">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 p-5 shadow-2xl">
            <p className="text-sm text-indigo-100">
              Piano attuale
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              Starter
            </h3>

            <p className="mt-2 text-sm text-indigo-100">
              Sblocca analytics avanzate,
              automazioni e utenti illimitati.
            </p>

            <Link
              href="/billing"
              className="
                mt-5 block
                rounded-2xl
                bg-white
                py-3 text-center
                font-semibold
                text-black
                transition
                hover:bg-gray-100
              "
            >
              Upgrade Pro
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}