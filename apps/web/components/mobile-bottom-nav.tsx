'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  CalendarDays,
  FolderOpen,
  Home,
  MessageCircle,
  Users,
} from 'lucide-react';

const navItems = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: Home,
  },
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
    label: 'Chat',
    href: '/chat',
    icon: MessageCircle,
  },
  {
    label: 'AI',
    href: '/assistant',
    icon: Bot,
  },
  {
    label: 'File',
    href: '/files',
    icon: FolderOpen,
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 rounded-3xl border border-white/10 bg-[#111827]/95 px-2 py-2 text-white shadow-2xl backdrop-blur lg:hidden">
      <div className="grid grid-cols-6 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-semibold transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="mb-1 h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}