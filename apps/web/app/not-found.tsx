'use client';

import Link from 'next/link';

import { ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f1117] px-6 text-white">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#111827] p-10 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-600 font-bold text-white">
          NPA
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">
          News Platform Association
        </p>

        <h1 className="mt-4 text-6xl font-bold">
          404
        </h1>

        <h2 className="mt-4 text-3xl font-bold">
          Pagina non trovata
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-gray-400">
          La pagina che stai cercando non esiste oppure è stata spostata.
          Torna alla dashboard NPA o alla homepage della piattaforma.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 font-semibold transition hover:bg-indigo-500"
          >
            <Home size={18} />
            Vai alla dashboard
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-6 py-4 font-semibold transition hover:bg-white/5"
          >
            <ArrowLeft size={18} />
            Torna alla homepage
          </Link>
        </div>
      </div>
    </main>
  );
}