'use client';

import Link from 'next/link';

import {
  useMemo,
  useState,
} from 'react';

import { toast } from 'sonner';

import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  Bar as ReBar,
  BarChart as RechartsBarChart,
} from 'recharts';

import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Wallet,
} from 'lucide-react';

import DashboardSidebar from '@/components/dashboard-sidebar';

type Transaction = {
  id: string;

  type:
    | 'INCOME'
    | 'EXPENSE';

  amountCents: number;

  date: string;

  title: string;
};

export default function FinancePage() {
  const [transactions] =
    useState<Transaction[]>([
      {
        id: '1',

        type: 'INCOME',

        amountCents: 120000,

        date:
          new Date().toISOString(),

        title:
          'Quote associative',
      },

      {
        id: '2',

        type: 'EXPENSE',

        amountCents: 35000,

        date:
          new Date().toISOString(),

        title:
          'Affitto sala eventi',
      },

      {
        id: '3',

        type: 'INCOME',

        amountCents: 78000,

        date:
          new Date().toISOString(),

        title:
          'Sponsor evento',
      },

      {
        id: '4',

        type: 'EXPENSE',

        amountCents: 18000,

        date:
          new Date().toISOString(),

        title:
          'Materiale marketing',
      },
    ]);

  function formatMoney(
    cents: number,
  ) {
    return `€${(
      cents / 100
    ).toFixed(2)}`;
  }

  const incomeCents =
    transactions
      .filter(
        (t) =>
          t.type ===
          'INCOME',
      )
      .reduce(
        (sum, t) =>
          sum +
          t.amountCents,
        0,
      );

  const expenseCents =
    transactions
      .filter(
        (t) =>
          t.type ===
          'EXPENSE',
      )
      .reduce(
        (sum, t) =>
          sum +
          t.amountCents,
        0,
      );

  const balanceCents =
    incomeCents -
    expenseCents;

  const chartData =
    useMemo(() => {
      return [
        {
          month: 'Mag',

          entrate:
            incomeCents / 100,

          uscite:
            expenseCents / 100,
        },
      ];
    }, [
      incomeCents,
      expenseCents,
    ]);

  function downloadExport(
    format:
      | 'csv'
      | 'xlsx',
  ) {
    toast.success(
      `Export ${format.toUpperCase()} demo pronto`,
    );
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
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="mb-3 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
                  Financial overview
                </p>

                <h1 className="text-5xl font-bold">
                  Finanze
                </h1>

                <p className="mt-3 max-w-2xl text-gray-400">
                  Gestisci entrate,
                  uscite, export e
                  andamento finanziario
                  della piattaforma.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    downloadExport(
                      'csv',
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500"
                >
                  <Download size={18} />
                  Export CSV
                </button>

                <button
                  onClick={() =>
                    downloadExport(
                      'xlsx',
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 font-semibold transition hover:bg-white/5"
                >
                  <Download size={18} />
                  Export XLSX
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <Wallet className="text-emerald-300" />

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Saldo
                </span>
              </div>

              <h2 className="mt-5 text-4xl font-bold">
                {formatMoney(
                  balanceCents,
                )}
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Disponibilità attuale
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <ArrowUpRight className="text-indigo-300" />

                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                  Entrate
                </span>
              </div>

              <h2 className="mt-5 text-4xl font-bold">
                {formatMoney(
                  incomeCents,
                )}
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Totale entrate
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-red-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <ArrowDownRight className="text-red-300" />

                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                  Uscite
                </span>
              </div>

              <h2 className="mt-5 text-4xl font-bold">
                {formatMoney(
                  expenseCents,
                )}
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Totale spese
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <Wallet className="text-cyan-300" />

                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  Movimenti
                </span>
              </div>

              <h2 className="mt-5 text-4xl font-bold">
                {
                  transactions.length
                }
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Transazioni registrate
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}