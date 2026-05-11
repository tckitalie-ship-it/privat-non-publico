'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const items = [
  {
    href: '/dashboard',
    label: 'Cruscotto',
  },
  {
    href: '/events',
    label: 'Eventi',
  },
  {
    href: '/finance',
    label: 'Finanze',
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-black text-white px-3 py-2 rounded-lg"
      >
        ☰
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static z-50 top-0 left-0
          h-screen w-64 bg-white border-r p-5
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">
            Associazione SaaS
          </h2>

          <button
            onClick={() => setOpen(false)}
            className="lg:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-xl px-4 py-3 transition ${
                  active
                    ? 'bg-black text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-5 right-5">
          <div className="rounded-2xl bg-black text-white p-4">
            <p className="text-sm opacity-70">
              Piano attuale
            </p>

            <h3 className="text-xl font-bold mt-1">
              Starter
            </h3>

            <button className="mt-4 w-full bg-white text-black rounded-lg py-2 text-sm font-medium">
              Upgrade
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}