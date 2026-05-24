'use client';

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import { usePathname } from 'next/navigation';

import io from 'socket.io-client';

import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  Users,
  Settings,
  CreditCard,
  Bot,
  MessageCircle,
  Folder,
  Building2,
  Search,
  Menu,
  X,
  Bell,
} from 'lucide-react';

import { API_URL } from '@/lib/api';

const socket = io(API_URL, {
  transports: ['websocket'],
});

const mainItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },

  {
    label: 'Search',
    href: '/search',
    icon: Search,
  },

  {
    label: 'Assistant',
    href: '/assistant',
    icon: Bot,
  },

  {
    label: 'Chat',
    href: '/chat',
    icon: MessageCircle,
  },

  {
    label: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
];

const managementItems = [
  {
    label: 'Eventi',
    href: '/events',
    icon: CalendarDays,
  },

  {
    label: 'Membri',
    href: '/members',
    icon: Users,
  },

  {
    label: 'Files',
    href: '/files',
    icon: Folder,
  },

  {
    label: 'Associations',
    href: '/associations',
    icon: Building2,
  },
];

const businessItems = [
  {
    label: 'Finanze',
    href: '/finance',
    icon: Wallet,
  },

  {
    label: 'Billing',
    href: '/billing',
    icon: CreditCard,
  },

  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  const [open, setOpen] =
    useState(false);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  useEffect(() => {
    loadNotifications();

    socket.on(
      'notification:new',
      () => {
        setUnreadCount(
          (prev) => prev + 1,
        );
      },
    );

    return () => {
      socket.off(
        'notification:new',
      );
    };
  }, []);

  async function loadNotifications() {
    try {
      const token =
        localStorage.getItem(
          'token',
        );

      const res = await fetch(
        `${API_URL}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        return;
      }

      const data =
        await res.json();

      const unread =
        data.filter(
          (
            notification: any,
          ) => !notification.read,
        ).length;

      setUnreadCount(unread);
    } catch (error) {
      console.error(error);
    }
  }

  function Section({
    title,
    items,
  }: {
    title: string;
    items: typeof mainItems;
  }) {
    return (
      <div className="space-y-2">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
          {title}
        </p>

        <nav className="space-y-1">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(
                `${item.href}/`,
              );

            const Icon = item.icon;

            const isNotifications =
              item.href ===
              '/notifications';

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  setOpen(false)
                }
                className={`group flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                    : 'text-zinc-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                      active
                        ? 'bg-white/15'
                        : 'bg-white/[0.04] group-hover:bg-white/[0.08]'
                    }`}
                  >
                    <Icon size={18} />
                  </span>

                  <span>
                    {item.label}
                  </span>
                </div>

                {isNotifications &&
                  unreadCount >
                    0 && (
                    <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
                      {
                        unreadCount
                      }
                    </span>
                  )}
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  function NavLinks() {
    return (
      <div className="space-y-7">
        <Section
          title="Main"
          items={mainItems}
        />

        <Section
          title="Gestione"
          items={
            managementItems
          }
        />

        <Section
          title="Business"
          items={
            businessItems
          }
        />
      </div>
    );
  }

  function Brand() {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-bold text-white">
            AS
          </div>

          <div>
            <h2 className="text-base font-bold text-white">
              Association SaaS
            </h2>

            <p className="text-xs text-zinc-500">
              Premium workspace
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#090D14]/95 px-4 py-3 text-white backdrop-blur md:hidden">
        <div>
          <h2 className="text-sm font-bold">
            Association SaaS
          </h2>

          <p className="text-xs text-zinc-500">
            Dashboard
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setOpen(true)
          }
          className="rounded-xl border border-white/10 p-2 text-zinc-300 transition hover:bg-white/5"
        >
          <Menu size={22} />
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm md:hidden">
          <aside className="h-full w-80 max-w-[85vw] overflow-y-auto border-r border-white/10 bg-[#090D14] p-4 text-white shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-3">
              <Brand />

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="rounded-xl border border-white/10 p-2 text-zinc-300 transition hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            <NavLinks />
          </aside>
        </div>
      ) : null}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-white/10 bg-[#090D14] px-4 py-5 text-white md:flex">
        <Brand />

        <div className="mt-8 flex-1 overflow-y-auto pr-1">
          <NavLinks />
        </div>

        <div className="mt-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-sm font-semibold text-emerald-300">
            Sistema realtime attivo
          </p>

          <p className="mt-1 text-xs text-zinc-400">
            Websocket live online
          </p>
        </div>
      </aside>
    </>
  );
}