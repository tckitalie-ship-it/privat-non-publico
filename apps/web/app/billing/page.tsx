"use client";

import { useState } from "react";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  async function upgrade(priceId: string) {
    setLoading(true);

    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        associationId: "ID_ASSOCIAZIONE", // sostituisci dinamicamente
        priceId,
      }),
    });

    const data = await res.json();
    if (data.url) window.location.href = data.url;

    setLoading(false);
  }

  async function cancelSubscription() {
    setLoading(true);

    await fetch("/api/billing/cancel", {
      method: "POST",
    });

    alert("Abbonamento cancellato");
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Gestione Piano</h1>

      {/* Piano attuale */}
      <div className="mb-10 p-6 border rounded-xl bg-neutral-900">
        <h2 className="text-xl font-semibold">Piano attuale</h2>
        <p className="text-lg mt-2">Starter</p>
      </div>

      {/* Upgrade */}
      <div className="space-y-6">
        <div className="p-6 border rounded-xl bg-neutral-900">
          <h3 className="text-xl font-semibold">Passa a Pro</h3>
          <p className="text-neutral-400 mt-2">Funzionalità avanzate</p>

          <button
            onClick={() => upgrade(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!)}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Upgrade a Pro
          </button>
        </div>

        <div className="p-6 border rounded-xl bg-neutral-900">
          <h3 className="text-xl font-semibold">Passa a Enterprise</h3>
          <p className="text-neutral-400 mt-2">Tutto illimitato</p>

          <button
            onClick={() =>
              upgrade(process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE!)
            }
            disabled={loading}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Upgrade a Enterprise
          </button>
        </div>
      </div>

      {/* Cancel subscription */}
      <div className="mt-10 p-6 border rounded-xl bg-neutral-900">
        <h3 className="text-xl font-semibold text-red-400">Annulla abbonamento</h3>
        <p className="text-neutral-400 mt-2">
          Puoi annullare il tuo abbonamento in qualsiasi momento.
        </p>

        <button
          onClick={cancelSubscription}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Annulla abbonamento
        </button>
      </div>
    </div>
  );
}
