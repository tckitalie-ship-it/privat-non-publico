'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, RefreshCw, Save, Settings, User } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard-sidebar';

const API_URL = 'http://localhost:3000/api';

type Me = {
  id: string;
  email: string;
  associationId?: string;
  role?: string;
};

function getAccessToken() {
  if (typeof window === 'undefined') return null;

  const localToken = localStorage.getItem('access_token');
  if (localToken) return localToken;

  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === 'access_token') return decodeURIComponent(value);
  }

  return null;
}

function clearAccessToken() {
  localStorage.removeItem('access_token');
  document.cookie = 'access_token=; Max-Age=0; path=/';
}

export default function SettingsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  async function loadMe() {
    try {
      setLoading(true);
      setStatus('');

      const token = getAccessToken();

      if (!token) {
        throw new Error('Token mancante');
      }

      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Errore caricamento profilo');
      }

      setMe(data);
    } catch (err: any) {
      setStatus(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearAccessToken();
    window.location.href = '/login';
  }

  useEffect(() => {
    loadMe();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 px-6 py-8 md:ml-72">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
            >
              ← Dashboard
            </Link>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-[#111827] p-8 shadow-2xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-cyan-500/20 p-3 text-cyan-300">
                  <Settings className="h-8 w-8" />
                </div>

                <div>
                  <h1 className="text-5xl font-bold">Settings</h1>
                  <p className="mt-2 text-zinc-400">
                    Profilo, sessione, sicurezza e logout.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadMe}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <RefreshCw className="h-5 w-5" />
                Aggiorna
              </button>
            </div>
          </section>

          {status && (
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm font-semibold text-yellow-300">
              {status}
            </div>
          )}

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-500/20 p-3 text-cyan-300">
                  <User className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">Profilo</h2>
                  <p className="text-sm text-zinc-400">
                    Dati utente letti dal backend.
                  </p>
                </div>
              </div>

              {loading ? (
                <p className="text-zinc-400">Caricamento profilo...</p>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
                    <p className="text-xs uppercase text-zinc-500">Email</p>
                    <p className="mt-1 font-semibold">{me?.email || '-'}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
                    <p className="text-xs uppercase text-zinc-500">Ruolo</p>
                    <p className="mt-1 font-semibold">{me?.role || '-'}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
                    <p className="text-xs uppercase text-zinc-500">
                      Association ID
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold">
                      {me?.associationId || '-'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Sessione</h2>
                <p className="text-sm text-zinc-400">
                  Gestione accesso locale JWT.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">
                  JWT attivo nel browser.
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-4 font-bold text-white hover:bg-red-600"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <Save className="h-6 w-6 text-cyan-300" />
              <div>
                <h2 className="text-2xl font-bold">Opzioni future</h2>
                <p className="text-sm text-zinc-400">
                  Qui aggiungeremo cambio password, preferenze workspace,
                  lingua, tema e notifiche account.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}