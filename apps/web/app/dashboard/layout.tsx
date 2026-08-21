"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Menu, User } from "lucide-react";

import DashboardSidebar from "@/components/dashboard-sidebar";
import { cn } from "@/lib/utils";
import { clearAccessToken, getAccessToken } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
const [authChecked, setAuthChecked] = useState(false);

useEffect(() => {
  const token = getAccessToken();

  if (!token) {
    router.replace("/login");
    return;
  }

  // Il controllo auth avviene solo client-side: questo stato evita il render del dashboard prima della verifica.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setAuthChecked(true);
}, [router]);

if (!authChecked) {
  return null;
}
  return (
    <div className="min-h-screen bg-[#0b1120] text-white">
      {/* SIDEBAR DESKTOP */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-[#0f172a] lg:block">
        <DashboardSidebar />
      </aside>

      {/* MOBILE OVERLAY */}
      <button
        type="button"
        aria-label="Chiudi menu"
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      {/* SIDEBAR MOBILE */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-[#0f172a] shadow-2xl transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <DashboardSidebar />
      </aside>

      {/* AREA PRINCIPALE */}
      <div className="min-w-0 lg:pl-64">
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0f172a]/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setMobileOpen((value) => !value)
                }
                className="rounded-lg p-2 text-gray-300 transition hover:bg-white/10 lg:hidden"
                aria-label="Apri menu"
              >
                <Menu size={22} />
              </button>

              <h1 className="truncate text-lg font-semibold tracking-tight">
                Gestione Associazione
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg p-2 text-gray-300 transition hover:bg-white/10"
                aria-label="Notifiche"
              >
                <Bell size={20} />
              </button>

              <div className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg p-2 text-gray-300 transition hover:bg-white/10"
                  aria-label="Menu utente"
                >
                  <User size={20} />
                  <ChevronDown size={17} />
                </button>

                <div className="pointer-events-none absolute right-0 mt-2 w-48 translate-y-1 rounded-xl border border-white/10 bg-[#111827] py-2 opacity-0 shadow-2xl transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
                  >
                    Profilo
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
                  >
                    Impostazioni
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => {
                      clearAccessToken();
                    }}
                    className="block px-4 py-2 text-sm text-red-400 transition hover:bg-white/10"
                  >
                    Logout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENUTO */}
        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1500px] min-w-0">
            {children}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-[#0f172a] px-4 py-5 text-center text-sm text-gray-400 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Associazione Manager — Tutti i diritti riservati
        </footer>
      </div>
    </div>
  );
}
