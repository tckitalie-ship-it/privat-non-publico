'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { API_URL, getAccessToken } from '@/lib/api';

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore checkout');
      }

      if (!data.url) {
        throw new Error('URL checkout mancante');
      }

      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || 'Errore checkout');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0f1117] p-8 text-white lg:ml-72">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-5xl font-bold">Billing</h1>
          <p className="mt-2 text-gray-400">
            Gestisci piano, abbonamento e upgrade
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
            <h2 className="text-2xl font-bold">Starter</h2>
            <p className="mt-2 text-gray-400">Piano gratuito</p>

            <p className="mt-8 text-5xl font-bold">€0</p>
            <p className="mt-2 text-sm text-gray-400">/ mese</p>

            <button
              type="button"
              className="mt-8 w-full rounded-xl border border-white/10 py-3 text-gray-300"
            >
              Piano attuale
            </button>
          </div>

          <div className="scale-105 rounded-3xl border border-indigo-500/30 bg-indigo-600 p-6 shadow-xl shadow-indigo-950/40">
            <div className="inline-block rounded-full bg-white px-3 py-1 text-sm font-semibold text-indigo-700">
              POPOLARE
            </div>

            <h2 className="mt-4 text-2xl font-bold">Pro</h2>
            <p className="mt-2 text-indigo-100">Per associazioni attive</p>

            <p className="mt-8 text-5xl font-bold">€19</p>
            <p className="mt-2 text-sm text-indigo-100">/ mese</p>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-white py-3 font-semibold text-indigo-700 transition hover:bg-gray-100 disabled:opacity-60"
            >
              {loading ? 'Apro Stripe...' : 'Upgrade a Pro'}
            </button>
          </div>

          <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
            <h2 className="text-2xl font-bold">Enterprise</h2>
            <p className="mt-2 text-gray-400">Per grandi organizzazioni</p>

            <p className="mt-8 text-5xl font-bold">€99</p>
            <p className="mt-2 text-sm text-gray-400">/ mese</p>

            <button
              type="button"
              className="mt-8 w-full rounded-xl border border-white/10 py-3 text-gray-300 transition hover:bg-white/5"
            >
              Contatta vendite
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}