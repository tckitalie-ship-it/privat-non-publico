'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { LogOut, Shield, Settings, User } from 'lucide-react';

import { getAccessToken } from '@/lib/api';
import DashboardSidebar from '@/components/dashboard-sidebar';

type TokenPayload = {
  sub?: string;
  email?: string;
  associationId?: string | null;
  role?: string | null;
  iat?: number;
  exp?: number;
};

function parseToken(token: string | null): TokenPayload | null {
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function SettingsPage() {
  const payload = useMemo(() => {
    return parseToken(getAccessToken());
  }, []);

  function handleLogout() {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 px-6 py-8 md:ml-72">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
            >
              ← Dashboard
            </Link>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-[#111827] p-8 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-indigo-600/20 p-4 text-indigo-300">
                <Settings className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-5xl font-bold">Settings</h1>
                <p className="mt-3 text-zinc-400">
                  Gestisci account, associazione attiva e sessione.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <User className="h-8 w-8 text-indigo-300" />
              <p className="mt-5 text-sm text-zinc-400">Utente</p>
              <h2 className="mt-2 break-all text-xl font-semibold">
                {payload?.email || 'Non disponibile'}
              </h2>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <Shield className="h-8 w-8 text-emerald-300" />
              <p className="mt-5 text-sm text-zinc-400">Ruolo</p>
              <h2 className="mt-2 text-xl font-semibold">
                {payload?.role || 'Nessun ruolo'}
              </h2>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <Settings className="h-8 w-8 text-cyan-300" />
              <p className="mt-5 text-sm text-zinc-400">
                Associazione attiva
              </p>
              <h2 className="mt-2 break-all text-sm font-semibold">
                {payload?.associationId || 'Nessuna associazione'}
              </h2>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-white/10 bg-[#111827] p-6">
            <h2 className="text-2xl font-semibold">Sessione</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-5">
                <p className="text-sm text-zinc-500">User ID</p>
                <p className="mt-2 break-all text-sm text-zinc-300">
                  {payload?.sub || 'Non disponibile'}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-5">
                <p className="text-sm text-zinc-500">Token expiry</p>
                <p className="mt-2 text-sm text-zinc-300">
                  {payload?.exp
                    ? new Date(payload.exp * 1000).toLocaleString('it-IT')
                    : 'Non disponibile'}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
            <h2 className="text-2xl font-semibold text-red-200">
              Danger zone
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-red-200/80">
              Esci dalla sessione corrente. Il token locale verrà rimosso e
              tornerai alla pagina login.
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-400"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}