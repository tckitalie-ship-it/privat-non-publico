'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { API_URL, getAccessToken } from '@/lib/api';
import DashboardSidebar from '@/components/dashboard-sidebar';

type Transaction = {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category?: string;
  description?: string;
  amountCents: number;
  date: string;
};

type Summary = {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
  transactionsCount: number;
};

export default function FinancePage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    incomeCents: 0,
    expenseCents: 0,
    balanceCents: 0,
    transactionsCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [creating, setCreating] = useState(false);

  function formatMoney(cents: number) {
    return `€${(cents / 100).toFixed(2)}`;
  }

  const chartData = useMemo(() => {
    const months = new Map<
      string,
      { month: string; entrate: number; uscite: number }
    >();

    transactions.forEach((transaction) => {
      const d = new Date(transaction.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}`;

      const label = d.toLocaleDateString('it-IT', {
        month: 'short',
        year: '2-digit',
      });

      if (!months.has(key)) {
        months.set(key, {
          month: label,
          entrate: 0,
          uscite: 0,
        });
      }

      const item = months.get(key)!;

      if (transaction.type === 'INCOME') {
        item.entrate += transaction.amountCents / 100;
      } else {
        item.uscite += transaction.amountCents / 100;
      }
    });

    return Array.from(months.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value);
  }, [transactions]);

  async function loadFinance() {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const [transactionsRes, summaryRes] = await Promise.all([
        fetch(`${API_URL}/api/finances/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/finances/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const transactionsData = await transactionsRes.json();
      const summaryData = await summaryRes.json();

      if (!transactionsRes.ok) {
        throw new Error(
          transactionsData.message || 'Errore caricamento transazioni',
        );
      }

      if (!summaryRes.ok) {
        throw new Error(summaryData.message || 'Errore caricamento riepilogo');
      }

      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      setSummary({
        incomeCents: summaryData.incomeCents || 0,
        expenseCents: summaryData.expenseCents || 0,
        balanceCents: summaryData.balanceCents || 0,
        transactionsCount: summaryData.transactionsCount || 0,
      });
    } catch (err: any) {
      toast.error(err.message || 'Errore caricamento finanze');
    } finally {
      setLoading(false);
    }
  }

  async function downloadExport(format: 'csv' | 'xlsx') {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/finances/export.${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error();
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `transactions.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      toast.error(`Errore export ${format.toUpperCase()}`);
    }
  }

  async function createTransaction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    const amountCents = Math.round(Number(amount.replace(',', '.')) * 100);

    if (!amountCents || amountCents <= 0) {
      toast.error('Inserisci un importo valido');
      return;
    }

    try {
      setCreating(true);

      const res = await fetch(`${API_URL}/api/finances/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          amountCents,
          category,
          description,
          date: date || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore creazione transazione');
      }

      toast.success('Transazione creata');

      setType('INCOME');
      setCategory('');
      setDescription('');
      setAmount('');
      setDate('');

      await loadFinance();
    } catch (err: any) {
      toast.error(err.message || 'Errore creazione transazione');
    } finally {
      setCreating(false);
    }
  }

  async function deleteTransaction(id: string) {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/finances/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore eliminazione transazione');
      }

      toast.success('Transazione eliminata');
      await loadFinance();
    } catch (err: any) {
      toast.error(err.message || 'Errore eliminazione transazione');
    }
  }

  useEffect(() => {
    loadFinance();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 p-8 lg:ml-72">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold">Finanze</h1>
              <p className="mt-2 text-gray-400">
                Gestisci entrate, uscite e saldo
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => downloadExport('csv')}
                className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500"
              >
                Export CSV
              </button>

              <button
                onClick={() => downloadExport('xlsx')}
                className="rounded-xl border border-white/10 px-5 py-3 font-semibold hover:bg-white/5"
              >
                Export XLSX
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="rounded-xl border border-white/10 px-5 py-3 hover:bg-white/5"
              >
                Dashboard
              </button>
            </div>
          </div>

          <section className="grid gap-5 md:grid-cols-4">
            <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
              <p className="text-sm text-gray-400">Saldo</p>
              <h2 className="mt-3 text-4xl font-bold">
                {formatMoney(summary.balanceCents)}
              </h2>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
              <p className="text-sm text-gray-400">Entrate</p>
              <h2 className="mt-3 text-4xl font-bold text-emerald-300">
                {formatMoney(summary.incomeCents)}
              </h2>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
              <p className="text-sm text-gray-400">Uscite</p>
              <h2 className="mt-3 text-4xl font-bold text-red-300">
                {formatMoney(summary.expenseCents)}
              </h2>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
              <p className="text-sm text-gray-400">Transazioni</p>
              <h2 className="mt-3 text-4xl font-bold">
                {summary.transactionsCount}
              </h2>
            </div>
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Andamento finanziario</h2>
              <p className="mt-1 text-gray-400">Entrate e uscite per mese</p>
            </div>

            <div className="h-96">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-white/5 bg-[#111827] text-gray-400">
                  Nessun dato per il grafico.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                    <Bar
                      dataKey="entrate"
                      fill="#34d399"
                      radius={[12, 12, 0, 0]}
                    />
                    <Bar
                      dataKey="uscite"
                      fill="#f87171"
                      radius={[12, 12, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
            <h2 className="mb-6 text-2xl font-bold">Nuova transazione</h2>

            <form
              onSubmit={createTransaction}
              className="grid gap-4 md:grid-cols-[160px_1fr_1fr_160px_180px_140px]"
            >
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as 'INCOME' | 'EXPENSE')
                }
                className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
              >
                <option value="INCOME">Entrata</option>
                <option value="EXPENSE">Uscita</option>
              </select>

              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Categoria"
                className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
              />

              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrizione"
                className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
              />

              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Importo"
                inputMode="decimal"
                className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
                required
              />

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
              />

              <button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500 disabled:opacity-60"
              >
                {creating ? 'Salvo...' : 'Aggiungi'}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
            <h2 className="mb-6 text-2xl font-bold">Transazioni</h2>

            {loading && <p className="text-gray-400">Caricamento...</p>}

            {!loading && transactions.length === 0 && (
              <p className="text-gray-400">Nessuna transazione trovata.</p>
            )}

            {!loading && transactions.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-white/5">
                <table className="w-full text-left">
                  <thead className="bg-[#111827] text-sm text-gray-400">
                    <tr>
                      <th className="px-5 py-4">Tipo</th>
                      <th className="px-5 py-4">Categoria</th>
                      <th className="px-5 py-4">Descrizione</th>
                      <th className="px-5 py-4">Importo</th>
                      <th className="px-5 py-4">Data</th>
                      <th className="px-5 py-4 text-right">Azione</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-white/5">
                        <td className="px-5 py-4">
                          <span
                            className={
                              transaction.type === 'INCOME'
                                ? 'rounded-full bg-emerald-600/20 px-3 py-1 text-sm text-emerald-300'
                                : 'rounded-full bg-red-600/20 px-3 py-1 text-sm text-red-300'
                            }
                          >
                            {transaction.type === 'INCOME'
                              ? 'Entrata'
                              : 'Uscita'}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-gray-300">
                          {transaction.category || '-'}
                        </td>

                        <td className="px-5 py-4 text-gray-300">
                          {transaction.description || '-'}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {formatMoney(transaction.amountCents)}
                        </td>

                        <td className="px-5 py-4 text-gray-300">
                          {new Date(transaction.date).toLocaleDateString(
                            'it-IT',
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10"
                          >
                            Elimina
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}