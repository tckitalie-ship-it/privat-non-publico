"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock3,
  Users,
} from "lucide-react";

import { useKpis } from "@/hooks/useKpis";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

const cards = [
  {
    key: "members",
    label: "Totale membri",
    icon: Users,
    iconClass:
      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    key: "income",
    label: "Entrate",
    icon: ArrowDownLeft,
    iconClass:
      "bg-green-500/10 text-green-400 border-green-500/20",
  },
  {
    key: "expense",
    label: "Uscite",
    icon: ArrowUpRight,
    iconClass:
      "bg-red-500/10 text-red-400 border-red-500/20",
  },
  {
    key: "invitations",
    label: "Inviti in sospeso",
    icon: Clock3,
    iconClass:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
] as const;

export function DashboardKpis() {
  const {
    data,
    loading,
    error,
    fetchKpis,
  } = useKpis();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-white/10" />

              <div className="h-3 w-16 rounded bg-white/5" />
            </div>

            <div className="mt-6 h-4 w-28 rounded bg-white/10" />

            <div className="mt-3 h-9 w-36 rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
        <p className="font-medium text-red-300">
          Errore nel caricamento dei KPI
        </p>

        <p className="mt-2 text-sm text-red-200/70">
          {error}
        </p>

        <button
          type="button"
          onClick={() => void fetchKpis()}
          className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
        >
          Riprova
        </button>
      </div>
    );
  }

  const values: Record<
    (typeof cards)[number]["key"],
    string | number
  > = {
    members: data?.membersCount ?? 0,
    income: formatCurrency(
      data?.incomeCents ?? 0,
    ),
    expense: formatCurrency(
      data?.expenseCents ?? 0,
    ),
    invitations:
      data?.pendingInvitations ?? 0,
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.key}
            className="group min-w-0 rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#111827]"
          >
            <div className="flex items-start justify-between gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${card.iconClass}`}
              >
                <Icon size={22} />
              </div>

              <span className="text-xs font-medium text-gray-600">
                Dashboard
              </span>
            </div>

            <p className="mt-6 text-sm font-medium text-gray-400">
              {card.label}
            </p>

            <p className="mt-2 truncate text-3xl font-bold tracking-tight text-white">
              {values[card.key]}
            </p>
          </article>
        );
      })}
    </div>
  );
}