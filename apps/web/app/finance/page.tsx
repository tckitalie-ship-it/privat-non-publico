'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { API_URL, getAccessToken } from '@/lib/api';

type Transaction = {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amountCents: number;
  category?: string;
  description?: string;
  date: string;
};

export default function FinancePage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  async function loadTransactions() {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/finances/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Errore caricamento movimenti');
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

      toast.success('Movimento creato');

      await loadTransactions();
    } catch (err: any) {
      toast.error(err.message || 'Errore creazione movimento');
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
        toast.error('Errore export file');
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

      toast.success(
        format === 'csv'
          ? 'CSV esportato con successo'
          : 'Excel esportato con successo',
      );
    } catch {
      toast.error('Errore export file');
    }
  }

  const balance = transactions.reduce((acc, item) => {
    return item.type === 'INCOME'
      ? acc + item.amountCents
      : acc - item.amountCents;
  }, 0);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Finanze</h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportFile('csv')}
            className="border px-3 py-2 rounded"
          >
            Esporta CSV
          </button>

          <button
            onClick={() => exportFile('xlsx')}
            className="border px-3 py-2 rounded"
          >
            Esporta Excel
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="border px-3 py-2 rounded"
          >
            Dashboard
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-5">
        <p className="text-sm text-gray-500">Saldo attuale</p>
        <p className="text-3xl font-bold mt-2">€{(balance / 100).toFixed(2)}</p>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white shadow rounded-xl p-5 space-y-4"
      >
        <h2 className="text-xl font-semibold">Nuovo movimento</h2>

        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
          className="w-full border rounded px-3 py-2"
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
          className="w-full border rounded px-3 py-2"
          required
        />

        <input
          type="text"
          placeholder="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <textarea
          placeholder="Descrizione"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
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
          <div key={item.id} className="bg-white shadow rounded-xl p-5 border">
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

            <p className="text-xs text-gray-400 mt-3">
              {new Date(item.date).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}