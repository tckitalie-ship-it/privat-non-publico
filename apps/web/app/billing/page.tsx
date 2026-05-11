'use client';

import { useState } from 'react';

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    try {
      setLoading(true);

      const token = localStorage.getItem('access_token');

      if (!token) {
        alert('Devi fare login');
        return;
      }

      const res = await fetch(
        'http://127.0.0.1:3001/api/billing/checkout',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Errore checkout');
        return;
      }

      if (!data.url) {
        alert('URL checkout mancante');
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert('Errore checkout');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            Billing
          </h1>

          <p className="text-gray-500 mt-2">
            Gestisci il tuo abbonamento
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow border p-6">
            <h2 className="text-2xl font-bold">
              Starter
            </h2>

            <p className="text-gray-500 mt-2">
              Piano gratuito
            </p>

            <p className="text-5xl font-bold mt-8">
              €0
            </p>

            <button className="mt-8 w-full border rounded-xl py-3">
              Piano attuale
            </button>
          </div>

          <div className="bg-black text-white rounded-2xl shadow p-6 scale-105">
            <div className="inline-block bg-white text-black px-3 py-1 rounded-full text-sm font-semibold">
              POPOLARE
            </div>

            <h2 className="text-2xl font-bold mt-4">
              Pro
            </h2>

            <p className="opacity-70 mt-2">
              Per associazioni attive
            </p>

            <p className="text-5xl font-bold mt-8">
              €19
            </p>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-8 w-full bg-white text-black rounded-xl py-3 font-semibold hover:bg-gray-200 transition"
            >
              {loading
                ? 'Caricamento...'
                : 'Upgrade a Pro'}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow border p-6">
            <h2 className="text-2xl font-bold">
              Enterprise
            </h2>

            <p className="text-gray-500 mt-2">
              Per grandi organizzazioni
            </p>

            <p className="text-5xl font-bold mt-8">
              €99
            </p>

            <button className="mt-8 w-full border rounded-xl py-3">
              Contatta vendite
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}