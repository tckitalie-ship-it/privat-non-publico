"use client";

import { Wallet, Plus } from "lucide-react";

interface FinanceHeaderProps {
  income: number;
  expenses: number;
  balance: number;
}

export default function FinanceHeader({
  income,
  expenses,
  balance,
}: FinanceHeaderProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-8 shadow-2xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-emerald-500/10 p-4">
            <Wallet className="h-8 w-8 text-emerald-300" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">
              Gestione Finanze
            </h1>

            <p className="mt-2 text-gray-400">
              Controlla entrate, uscite e saldo della tua associazione.
            </p>
          </div>

        </div>

        <button className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 font-semibold text-white transition hover:bg-emerald-500">
          <Plus className="h-5 w-5" />
          Nuova transazione
        </button>

      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <p className="text-sm text-emerald-200">Entrate</p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            € {income.toFixed(2)}
          </h2>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
          <p className="text-sm text-red-200">Uscite</p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            € {expenses.toFixed(2)}
          </h2>
        </div>

        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5">
          <p className="text-sm text-indigo-200">Saldo</p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            € {balance.toFixed(2)}
          </h2>
        </div>

      </div>
    </section>
  );
}