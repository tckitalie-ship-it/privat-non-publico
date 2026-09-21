"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Calendar,
  ClipboardList,
  Clock,
  Folder,
  LayoutDashboard,
  Settings,
  User,
  Users,
  Wallet,
} from "lucide-react";

import AssociationSwitcher from "@/components/association-switcher";
import LogoutButton from "@/components/logout-button";
import { NotificationBell } from "@/components/notification-bell";
import ThemeToggle from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { getAccessToken } from "@/lib/api";

type Role = "OWNER" | "ADMIN" | "MEMBER";

type JwtPayload = {
  role?: string | null;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
};

const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["OWNER", "ADMIN", "MEMBER"],
  },
  {
    label: "Eventi",
    href: "/dashboard/events",
    icon: Calendar,
    roles: ["OWNER", "ADMIN", "MEMBER"],
  },
  {
    label: "Membri",
    href: "/members",
    icon: Users,
    roles: ["OWNER", "ADMIN", "MEMBER"],
  },
  {
    label: "Finanze",
    href: "/dashboard/finance",
    icon: Wallet,
    roles: ["OWNER", "ADMIN"],
  },
  {
    label: "Promemoria",
    href: "/dashboard/reminders",
    icon: Clock,
    roles: ["OWNER", "ADMIN", "MEMBER"],
  },
  {
    label: "Notifiche",
    href: "/notifications",
    icon: Bell,
    roles: ["OWNER", "ADMIN", "MEMBER"],
  },
  {
    label: "File",
    href: "/dashboard/files",
    icon: Folder,
    roles: ["OWNER", "ADMIN", "MEMBER"],
  },
  {
    label: "Audit Log",
    href: "/dashboard/audit-log",
    icon: ClipboardList,
    roles: ["OWNER", "ADMIN"],
  },
];

function readJwtRole(token: string): Role | null {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalized = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded =
      normalized +
      "=".repeat((4 - (normalized.length % 4)) % 4);

    const decoded = decodeURIComponent(
      window
        .atob(padded)
        .split("")
        .map(
          (character) =>
            `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`,
        )
        .join(""),
    );

    const data = JSON.parse(decoded) as JwtPayload;

    if (
      data.role === "OWNER" ||
      data.role === "ADMIN" ||
      data.role === "MEMBER"
    ) {
      return data.role;
    }

    return null;
  } catch {
    return null;
  }
}

export default function DashboardSidebar() {
  const pathname = usePathname();

  const [role, setRole] = useState<Role | null>(null);

  const [user, setUser] = useState<{
    name?: string | null;
    email?: string | null;
  } | null>(null);

  useEffect(() => {
    const token = getAccessToken();

    if (token) {
      setRole(readJwtRole(token));
    }

    async function loadUser() {
      try {
        if (!token) {
          return;
        }

        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setUser(data);
      } catch (error) {
        console.error("Errore caricamento profilo:", error);
      }
    }

    void loadUser();
  }, []);

  const visibleNavigation = useMemo(() => {
    if (!role) {
      return navigation;
    }

    return navigation.filter((item) =>
      item.roles.includes(role),
    );
  }, [role]);

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#0d1117] text-gray-300">
      {/* HEADER */}
      <header className="shrink-0 border-b border-[#21262d] px-5 py-5">
        <h1 className="text-xl font-bold leading-tight text-white">
          Gestione Associazione
        </h1>

        <p className="mt-1 text-xs text-gray-500">
          Dashboard amministrativa
        </p>
      </header>

      {/* ASSOCIATION SWITCHER */}
      <section className="shrink-0 border-b border-[#21262d] px-4 py-4">
        <AssociationSwitcher />
      </section>

      {/* NAVIGATION */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          Navigazione
        </p>

        <div className="space-y-1">
          {visibleNavigation.map((item) => {
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
                <Icon
                  size={19}
                  className="shrink-0"
                />

                <span className="truncate">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="my-5 border-t border-[#21262d]" />

        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          Sistema
        </p>

        <Link
          href="/dashboard/profile"
          className={cn(
            "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
            isActive("/dashboard/profile")
              ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
              : "text-gray-400 hover:bg-[#161b22] hover:text-white",
          )}
        >
          <User
            size={19}
            className="shrink-0"
          />

          <span className="truncate">
            Profilo
          </span>
        </Link>

        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
            isActive("/dashboard/settings")
              ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
              : "text-gray-400 hover:bg-[#161b22] hover:text-white",
          )}
        >
          <Settings
            size={19}
            className="shrink-0"
          />

          <span className="truncate">
            Impostazioni
          </span>
        </Link>
      </nav>

      {/* FOOTER */}
      <footer className="shrink-0 border-t border-[#21262d] px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <NotificationBell />
          <ThemeToggle />
        </div>

        <div className="mb-3 rounded-xl border border-[#30363d] bg-[#161b22] px-4 py-3">
          <p className="text-sm font-semibold text-white">
            {user?.name || "Profilo utente"}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {user?.email || "Dashboard SaaS"}
          </p>
        </div>

        <LogoutButton />
      </footer>
    </div>
  );
}
