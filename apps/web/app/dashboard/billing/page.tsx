'use client';

import Link from 'next/link';

export default function BillingPage() {
  return (
    <main className="min-h-screen bg-[#0f1117] p-8 text-white">
      <Link
        href="/dashboard"
        className="rounded-xl border border-white/10 px-4 py-2 text-sm"
      >
        ← Dashboard
      </Link>

      <section className="mt-8 rounded-3xl border border-white/10 bg-[#111827] p-8">
        <h1 className="text-5xl font-bold">Billing</h1>
        <p className="mt-3 text-zinc-400">
          Gestisci piano, upgrade e subscription.
        </p>
      </section>
    </main>
  );
}