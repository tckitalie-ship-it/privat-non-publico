'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL, getAccessToken } from '@/lib/api';

type Transaction = {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amountCents: number;
  category?: string;
  description?: string;
  date: string;
};

export default function FinancesPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  async function loadTransactions() {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/finances/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      setMessage('Errore caricamento movimenti');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/finances/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          amountCents: Math.round(Number(amount) * 100),
          category,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore creazione movimento');
      }

      setAmount('');
      setCategory('');
      setDescription('');
      setMessage('Movimento creato');

      await loadTransactions();
    } catch (err: any) {
      setMessage(err.message || 'Errore creazione movimento');
    }
  }

  async function exportFile(format: 'csv' | 'xlsx') {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/finances/export.${format}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setMessage('Errore export file');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = format === 'csv' ? 'movimenti.csv' : 'movimenti.xlsx';

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      setMessage('Errore export file');
    }
  }

  const balance = transactions.reduce((acc, item) => {
    return item.type === 'INCOME'
      ? acc + item.amountCents
      : acc - item.amountCents;
  }, 0);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Finanze</h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportFile('csv')}
            className="rounded border px-3 py-2"
          >
            Esporta CSV
          </button>

          <button
            onClick={() => exportFile('xlsx')}
            className="rounded border px-3 py-2"
          >
            Esporta Excel
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="rounded border px-3 py-2"
          >
            Dashboard
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <p className="text-sm text-gray-500">Saldo attuale</p>
        <p className="mt-2 text-3xl font-bold">€{(balance / 100).toFixed(2)}</p>
      </div>

      <form
        onSubmit={handleCreate}
        className="space-y-4 rounded-xl bg-white p-5 shadow"
      >
        <h2 className="text-xl font-semibold">Nuovo movimento</h2>

        {message && (
          <div className="rounded bg-gray-100 p-3 text-sm">{message}</div>
        )}

        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
          className="w-full rounded border px-3 py-2"
        >
          <option value="INCOME">Entrata</option>
          <option value="EXPENSE">Uscita</option>
        </select>

        <input
          type="number"
          step="0.01"
          placeholder="Importo"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />

        <input
          type="text"
          placeholder="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />

        <textarea
          placeholder="Descrizione"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />

        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Salva movimento
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Movimenti</h2>

        {loading && <p className="text-gray-500">Caricamento...</p>}

        {!loading && transactions.length === 0 && (
          <p className="text-gray-500">Nessun movimento.</p>
        )}

        {transactions.map((item) => (
          <div key={item.id} className="rounded-xl border bg-white p-5 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {item.category || 'Senza categoria'}
                </p>

                <p className="text-sm text-gray-500">{item.description}</p>
              </div>

              <div
                className={`font-bold ${
                  item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.type === 'INCOME' ? '+' : '-'}€
                {(item.amountCents / 100).toFixed(2)}
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              {new Date(item.date).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}