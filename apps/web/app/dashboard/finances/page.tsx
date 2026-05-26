'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Search,
} from 'lucide-react';

import { toast } from 'sonner';

import { getAccessToken } from '@/lib/api';

import DashboardSidebar from '@/components/dashboard-sidebar';

type Transaction = {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amountCents: number;
  description?: string | null;
  category?: string | null;
  createdAt?: string;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

export default function FinancesPage() {
  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [showForm, setShowForm] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [
    loadingTransactions,
    setLoadingTransactions,
  ] = useState(true);

  const [search, setSearch] =
    useState('');

  const [type, setType] =
    useState<'INCOME' | 'EXPENSE'>(
      'INCOME',
    );

  const [amount, setAmount] =
    useState('');

  const [
    description,
    setDescription,
  ] = useState('');

  const [category, setCategory] =
    useState('');

  async function loadTransactions() {
    try {
      setLoadingTransactions(true);

      const token =
        getAccessToken();

      const res = await fetch(
        '/api/finances',
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        },
      );

      if (!res.ok) {
        throw new Error(
          'Errore caricamento finanze',
        );
      }

      const data = await res.json();

      setTransactions(
        Array.isArray(data)
          ? data
          : [],
      );
    } catch (error) {
      console.error(error);

      toast.error(
        'Errore caricamento finanze',
      );

      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  async function handleCreateTransaction(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      const token =
        getAccessToken();

      const amountNumber = Number(
        amount.replace(',', '.'),
      );

      if (
        !amountNumber ||
        amountNumber <= 0
      ) {
        throw new Error(
          'Importo non valido',
        );
      }

      const res = await fetch(
        '/api/finances',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            type,
            amountCents:
              Math.round(
                amountNumber * 100,
              ),
            description,
            category,
          }),
        },
      );

      if (!res.ok) {
        throw new Error(
          'Errore creazione movimento',
        );
      }

      setType('INCOME');
      setAmount('');
      setDescription('');
      setCategory('');

      setShowForm(false);

      await loadTransactions();

      toast.success(
        'Movimento creato',
      );
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.message ||
          'Errore creazione movimento',
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredTransactions =
    useMemo(() => {
      return transactions.filter(
        (transaction) => {
          const text = `${transaction.description || ''} ${
            transaction.category || ''
          } ${transaction.type}`.toLowerCase();

          return text.includes(
            search.toLowerCase(),
          );
        },
      );
    }, [transactions, search]);

  const incomeCents =
    transactions
      .filter(
        (item) =>
          item.type === 'INCOME',
      )
      .reduce(
        (total, item) =>
          total +
          item.amountCents,
        0,
      );

  const expenseCents =
    transactions
      .filter(
        (item) =>
          item.type === 'EXPENSE',
      )
      .reduce(
        (total, item) =>
          total +
          item.amountCents,
        0,
      );

  const balanceCents =
    incomeCents - expenseCents;

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 px-6 py-8 md:ml-72">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
            >
              ← Dashboard
            </Link>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-[#111827] p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold">
                  Finanze
                </h1>

                <p className="mt-3 text-zinc-400">
                  Gestisci entrate,
                  uscite e saldo della
                  tua associazione.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    window.open(
                      '/api/finances/export.csv',
                      '_blank',
                    );
                  }}
                  className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Export CSV
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.open(
                      '/api/finances/export.xlsx',
                      '_blank',
                    );
                  }}
                  className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Export XLSX
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(
                      (value) =>
                        !value,
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  <Plus className="h-5 w-5" />
                  Nuovo movimento
                </button>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-emerald-500/10 p-6">
              <p className="text-sm text-emerald-300">
                Entrate
              </p>

              <h2 className="mt-3 text-4xl font-bold">
                {formatMoney(
                  incomeCents,
                )}
              </h2>
            </div>

            <div className="rounded-3xl border border-white/10 bg-red-500/10 p-6">
              <p className="text-sm text-red-300">
                Uscite
              </p>

              <h2 className="mt-3 text-4xl font-bold">
                {formatMoney(
                  expenseCents,
                )}
              </h2>
            </div>

            <div className="rounded-3xl border border-white/10 bg-indigo-500/10 p-6">
              <p className="text-sm text-indigo-300">
                Saldo
              </p>

              <h2 className="mt-3 text-4xl font-bold">
                {formatMoney(
                  balanceCents,
                )}
              </h2>
            </div>
          </section>

          {showForm && (
            <form
              onSubmit={
                handleCreateTransaction
              }
              className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <select
                  value={type}
                  onChange={(e) =>
                    setType(
                      e.target
                        .value as
                        | 'INCOME'
                        | 'EXPENSE',
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3"
                >
                  <option value="INCOME">
                    Entrata
                  </option>

                  <option value="EXPENSE">
                    Uscita
                  </option>
                </select>

                <input
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value,
                    )
                  }
                  placeholder="Importo, es. 25.50"
                  required
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3"
                />

                <input
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value,
                    )
                  }
                  placeholder="Categoria"
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3"
                />

                <input
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value,
                    )
                  }
                  placeholder="Descrizione"
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-5 rounded-2xl bg-white px-5 py-3 font-semibold text-zinc-950"
              >
                {loading
                  ? 'Salvataggio...'
                  : 'Salva movimento'}
              </button>
            </form>
          )}

          <section className="mt-8">
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111827] px-4">
              <Search className="h-5 w-5 text-zinc-500" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value,
                  )
                }
                placeholder="Cerca movimento..."
                className="w-full bg-transparent py-3 outline-none"
              />
            </div>

            {loadingTransactions ? (
              <div className="rounded-3xl border border-white/10 bg-[#111827] p-10 text-center text-zinc-400">
                Caricamento
                finanze...
              </div>
            ) : filteredTransactions.length ===
              0 ? (
              <div className="rounded-3xl border border-white/10 bg-[#111827] p-10 text-center text-zinc-500">
                Nessun movimento
                trovato.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map(
                  (
                    transaction,
                  ) => (
                    <div
                      key={
                        transaction.id
                      }
                      className="flex items-center justify-between rounded-3xl border border-white/10 bg-[#111827] p-5"
                    >
                      <div className="flex items-center gap-4">
                        {transaction.type ===
                        'INCOME' ? (
                          <ArrowUpCircle className="h-8 w-8 text-emerald-300" />
                        ) : (
                          <ArrowDownCircle className="h-8 w-8 text-red-300" />
                        )}

                        <div>
                          <h3 className="font-semibold">
                            {transaction.description ||
                              'Movimento'}
                          </h3>

                          <p className="text-sm text-zinc-400">
                            {transaction.category ||
                              'Senza categoria'}{' '}
                            ·{' '}
                            {transaction.createdAt
                              ? new Date(
                                  transaction.createdAt,
                                ).toLocaleDateString(
                                  'it-IT',
                                )
                              : ''}
                          </p>
                        </div>
                      </div>

                      <div
                        className={
                          transaction.type ===
                          'INCOME'
                            ? 'text-xl font-bold text-emerald-300'
                            : 'text-xl font-bold text-red-300'
                        }
                      >
                        {transaction.type ===
                        'INCOME'
                          ? '+'
                          : '-'}
                        {formatMoney(
                          transaction.amountCents,
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}