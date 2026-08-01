"use client";

import { useKpis } from "@/hooks/useKpis";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function DashboardKpis() {
  const {
    data,
    loading,
    error,
    fetchKpis,
  } = useKpis();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-white/10 bg-[#1a1f2e] p-6"
          >
            <div className="mb-4 h-4 w-24 rounded bg-gray-700" />
            <div className="h-8 w-32 rounded bg-gray-600" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="font-medium text-red-300">
          Errore nel caricamento dei KPI
        </p>

        <p className="mt-2 text-sm text-red-200/70">
          {error}
        </p>

        <button
          type="button"
          onClick={() => void fetchKpis()}
          className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
        >
          Riprova
        </button>
      </div>
    );
  }

  const cards = [
    {
      label: "Totale membri",
      value: data?.membersCount ?? 0,
    },
    {
      label: "Entrate",
      value: formatCurrency(data?.incomeCents ?? 0),
    },
    {
      label: "Uscite",
      value: formatCurrency(data?.expenseCents ?? 0),
    },
{
     label: "Inviti in sospeso",
     value: data?.pendingInvitations ?? 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="min-w-0 rounded-2xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl"
        >
          <p className="text-sm text-gray-400">
            {card.label}
          </p>

          <p className="mt-2 truncate text-3xl font-bold text-white">
            {card.value}
          </p>
        </article>
      ))}
    </div>
  );
}


