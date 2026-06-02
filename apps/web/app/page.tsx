'use client';

import Link from 'next/link';

import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Users,
  Wallet,
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0f1117] text-white">
      <section className="relative border-b border-white/10">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <header className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 font-bold">
              N
            </div>

            <div>
              <p className="font-bold">News Platform Association</p>
              <p className="text-xs text-gray-400">NPA Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/5"
            >
              Login
            </Link>

            <Link
              href="/login"
              className="hidden rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 sm:inline-flex"
            >
              Entra nella piattaforma
            </Link>
          </div>
        </header>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
              Piattaforma digitale per associazioni e community
            </p>

            <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
              News Platform Association.
              <br />
              La piattaforma completa per la gestione associativa.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              Gestisci membri, eventi, finanze, inviti, notifiche e dashboard
              operative con un sistema moderno, sicuro e pensato per la crescita
              della tua associazione.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-semibold transition hover:bg-blue-500"
              >
                Prova la demo
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/dashboard"
                className="rounded-2xl border border-white/10 px-6 py-4 font-semibold transition hover:bg-white/5"
              >
                Vai alla dashboard
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Multi-associazione
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Realtime
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Export CSV/XLSX
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-white/10 bg-[#111827] p-5 shadow-2xl">
              <div className="rounded-[1.5rem] bg-[#0f172a] p-5">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Dashboard NPA</p>
                    <h3 className="text-2xl font-bold">Panoramica</h3>
                  </div>

                  <div className="rounded-2xl bg-blue-600/20 px-4 py-2 text-sm text-blue-300">
                    Live
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ['Membri', '128', Users],
                    ['Eventi', '24', CalendarDays],
                    ['Entrate', '€8.420', Wallet],
                    ['KPI', '+18%', BarChart3],
                  ].map(([label, value, Icon]: any) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-300">
                        <Icon size={20} />
                      </div>

                      <p className="text-sm text-gray-400">{label}</p>
                      <p className="mt-1 text-2xl font-bold">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-semibold">Prossimi eventi</p>
                    <CalendarDays size={18} className="text-gray-400" />
                  </div>

                  <div className="space-y-3">
                    {[
                      'Assemblea annuale',
                      'Workshop volontari',
                      'Cena sociale',
                    ].map((event) => (
                      <div
                        key={event}
                        className="flex items-center justify-between rounded-xl bg-[#111827] px-4 py-3"
                      >
                        <span className="text-sm">{event}</span>
                        <span className="text-xs text-gray-400">Maggio</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}