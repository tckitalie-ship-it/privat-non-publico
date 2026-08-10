"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Calendar,
  Folder,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

import AssociationSwitcher from "@/components/association-switcher";
import LogoutButton from "@/components/logout-button";
import { NotificationBell } from "@/components/notification-bell";
import ThemeToggle from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/api";
const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Eventi",
    href: "/dashboard/events",
    icon: Calendar,
  },
  {
    label: "Membri",
    href: "/members",
    icon: Users,
  },
  {
    label: "Finanze",
    href: "/dashboard/finance",
    icon: Wallet,
  },
  {
    label: "Notifiche",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    label: "File",
    href: "/dashboard/files",
    icon: Folder,
  },
];
function UserRoleCard() {
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const token = getAccessToken();

    if (!token) return;

    try {
      const payload = token.split(".")[1];
      if (!payload) return;

      const normalized = payload
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const decoded = JSON.parse(atob(normalized));

      setRole(decoded.role ?? "");
    } catch {
      setRole("");
    }
  }, []);

  const label =
    role === "OWNER"
      ? "Proprietario"
      : role === "ADMIN"
        ? "Amministratore"
        : role === "MEMBER"
          ? "Membro"
          : "Utente";

  return (
    <div className="mb-3 rounded-xl border border-[#30363d] bg-[#161b22] px-4 py-3">
      <p className="text-sm font-semibold text-white">
        {label}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        Gestione Associazione
      </p>
    </div>
  );
}
export default function DashboardSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#0d1117] text-gray-300">
      {/* HEADER */}
      <header className="shrink-0 border-b border-[#21262d] px-5 py-5">
        <h1 className="text-xl font-bold leading-tight text-white">
          Gestione Associazione
        </h1>

         <p className="mt-1 text-xs text-gray-400">
            Gestione Associazione
         </p>
      </header>

      {/* ASSOCIATION SWITCHER */}
      <section className="shrink-0 border-b border-[#21262d] px-4 py-4">
        <AssociationSwitcher />
      </section>

      {/* NAVIGATION */}
      <nav className="min-h-0 flex-1 px-4 py-5">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          Navigazione
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                    : "text-gray-400 hover:bg-[#161b22] hover:text-white",
                )}
              >
                <Icon size={19} className="shrink-0" />

                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="my-5 border-t border-[#21262d]" />

        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          Sistema
        </p>

        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
            isActive("/dashboard/settings")
              ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
              : "text-gray-400 hover:bg-[#161b22] hover:text-white",
          )}
        >
          <Settings size={19} className="shrink-0" />

          <span className="truncate">Impostazioni</span>
        </Link>
      </nav>

      {/* FOOTER */}
      <footer className="shrink-0 border-t border-[#21262d] px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <NotificationBell />
          <ThemeToggle />
        </div>

        <UserRoleCard />

        <LogoutButton />
      </footer>
    </div>
  );
}
