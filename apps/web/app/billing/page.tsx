'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  Check,
  CreditCard,
  Crown,
  Rocket,
  Receipt,
  Sparkles,
} from 'lucide-react';

import { toast } from 'sonner';

import DashboardSidebar from '@/components/dashboard-sidebar';

type Invoice = {
  id: string;
  amount: string;
  status: 'Pagata' | 'In attesa';
  date: string;
};

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  const invoices: Invoice[] = [
    {
      id: 'INV-2026-001',
      amount: '€19.00',
      status: 'Pagata',
      date: '10 Maggio 2026',
    },
    {
      id: 'INV-2026-002',
      amount: '€19.00',
      status: 'Pagata',
      date: '10 Aprile 2026',
    },
    {
      id: 'INV-2026-003',
      amount: '€19.00',
      status: 'In attesa',
      date: '10 Giugno 2026',
    },
  ];

  async function handleUpgrade(plan: string) {
    try {
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      toast.success(`Piano ${plan} attivato in demo`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 p-8 md:ml-72">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
            >
              ← Dashboard
            </Link>
          </div>

          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827] p-8 shadow-2xl">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="mb-3 inline-flex rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
                  Subscription
                </p>

                <h1 className="text-5xl font-bold">Billing</h1>

                <p className="mt-3 max-w-2xl text-gray-400">
                  Gestisci piano, fatturazione, abbonamenti e upgrade premium.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4">
                <p className="text-sm text-emerald-300">Piano attivo</p>
                <p className="mt-1 text-2xl font-bold">Starter</p>
              </div>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-3">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <CreditCard className="text-indigo-300" />

                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                  Piano
                </span>
              </div>

              <h2 className="mt-5 text-4xl font-bold">Starter</h2>

              <p className="mt-2 text-sm text-gray-400">
                Accesso piattaforma base
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <Sparkles className="text-emerald-300" />

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Stato
                </span>
              </div>

              <h2 className="mt-5 text-4xl font-bold">Attivo</h2>

              <p className="mt-2 text-sm text-gray-400">
                Abbonamento operativo
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <Receipt className="text-cyan-300" />

                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  Fatture
                </span>
              </div>

              <h2 className="mt-5 text-4xl font-bold">{invoices.length}</h2>

              <p className="mt-2 text-sm text-gray-400">
                Documenti disponibili
              </p>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-8 shadow-2xl">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-gray-300" />

                <div>
                  <h2 className="text-3xl font-bold">Starter</h2>
                  <p className="text-gray-400">Piano gratuito</p>
                </div>
              </div>

              <div className="mt-8">
                <span className="text-5xl font-bold">€0</span>
                <span className="ml-2 text-gray-400">/ mese</span>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-300" />
                  Dashboard base
                </div>

                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-300" />
                  Gestione eventi
                </div>

                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-300" />
                  Membri
                </div>
              </div>

              <button className="mt-10 w-full rounded-2xl border border-white/10 py-4 font-semibold text-gray-300">
                Piano attuale
              </button>
            </div>

            <div className="relative scale-[1.02] rounded-3xl border border-indigo-500/30 bg-indigo-600 p-8 shadow-[0_0_80px_rgba(79,70,229,0.35)]">
              <div className="absolute right-5 top-5 rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-700">
                POPOLARE
              </div>

              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-yellow-200" />

                <div>
                  <h2 className="text-3xl font-bold">Pro</h2>
                  <p className="text-indigo-100">Associazioni attive</p>
                </div>
              </div>

              <div className="mt-8">
                <span className="text-5xl font-bold">€19</span>
                <span className="ml-2 text-indigo-100">/ mese</span>
              </div>

              <div className="mt-8 space-y-4 text-white">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5" />
                  Chat realtime
                </div>

                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5" />
                  Export avanzati
                </div>

                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5" />
                  Files premium
                </div>

                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5" />
                  Assistant AI
                </div>
              </div>

              <button
                onClick={() => handleUpgrade('Pro')}
                disabled={loading}
                className="mt-10 w-full rounded-2xl bg-white py-4 font-bold text-indigo-700 transition hover:bg-gray-100 disabled:opacity-60"
              >
                {loading ? 'Attivazione...' : 'Upgrade Pro'}
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-8 shadow-2xl">
              <div className="flex items-center gap-3">
                <Rocket className="h-8 w-8 text-cyan-300" />

                <div>
                  <h2 className="text-3xl font-bold">Enterprise</h2>
                  <p className="text-gray-400">Organizzazioni grandi</p>
                </div>
              </div>

              <div className="mt-8">
                <span className="text-5xl font-bold">€99</span>
                <span className="ml-2 text-gray-400">/ mese</span>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-300" />
                  Multi associazioni
                </div>

                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-300" />
                  Analytics avanzate
                </div>

                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-300" />
                  Priorità supporto
                </div>

                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-300" />
                  API private
                </div>
              </div>

              <button
                onClick={() => handleUpgrade('Enterprise')}
                disabled={loading}
                className="mt-10 w-full rounded-2xl border border-white/10 py-4 font-semibold transition hover:bg-white/5 disabled:opacity-60"
              >
                Contatta vendite
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[#1a1f2e] p-6 shadow-xl lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Storico fatture</h2>

                <p className="mt-1 text-gray-400">
                  Ultimi documenti disponibili
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300">
                {invoices.length} fatture
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-[#111827] p-5 transition hover:border-indigo-500/20 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                      <Receipt size={24} />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">{invoice.id}</h3>

                      <p className="mt-1 text-sm text-gray-400">
                        {invoice.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-right text-2xl font-bold">
                        {invoice.amount}
                      </p>

                      <p
                        className={`mt-1 text-right text-sm ${
                          invoice.status === 'Pagata'
                            ? 'text-emerald-300'
                            : 'text-amber-300'
                        }`}
                      >
                        {invoice.status}
                      </p>
                    </div>

                    <button
                      onClick={() => toast.success('Download demo avviato')}
                      className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/5"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}