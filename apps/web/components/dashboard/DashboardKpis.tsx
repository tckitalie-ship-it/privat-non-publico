"use client";

import { useEffect } from "react";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock3,
  Users,
} from "lucide-react";

import { useKpis } from "@/lib/hooks/useKpis";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

const cards = [
  {
    key: "members",
    label: "Totale membri",
    icon: Users,
    iconClass:
      "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    key: "income",
    label: "Entrate",
    icon: ArrowDownLeft,
    iconClass:
      "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    key: "expense",
    label: "Uscite",
    icon: ArrowUpRight,
    iconClass:
      "bg-red-50 text-red-600 border-red-100",
  },
  {
    key: "invitations",
    label: "Inviti in sospeso",
    icon: Clock3,
    iconClass:
      "bg-amber-50 text-amber-600 border-amber-100",
  },
] as const;

function LoadingCard() {
  return (
    <article className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="h-12 w-12 rounded-2xl bg-slate-100" />
        <div className="h-3 w-16 rounded bg-slate-100" />
      </div>

      <div className="mt-6 h-4 w-28 rounded bg-slate-100" />
      <div className="mt-3 h-9 w-36 rounded bg-slate-100" />
    </article>
  );
}

export function DashboardKpis() {
  const {
    data,
    loading,
    error,
    fetchKpis,
  } = useKpis();

  useEffect(() => {
    function handleFocus() {
      void fetchKpis();
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus,
      );
    };
  }, [fetchKpis]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === "kpisUpdated") {
        void fetchKpis();
      }
    }

    window.addEventListener(
      "storage",
      handleStorage,
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage,
      );
    };
  }, [fetchKpis]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <LoadingCard key={item} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-800">
          Errore nel caricamento dei KPI
        </p>

        <p className="mt-2 text-sm text-red-700">
          {error}
        </p>

        <button
          type="button"
          onClick={() => void fetchKpis()}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
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
    income: formatCurrency(data?.incomeCents ?? 0),
    expense: formatCurrency(data?.expenseCents ?? 0),
    invitations: data?.pendingInvitations ?? 0,
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.key}
            className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${card.iconClass}`}
              >
                <Icon
                  size={22}
                  strokeWidth={2}
                />
              </div>

              <span className="text-xs font-medium text-slate-400">
                Dashboard
              </span>
            </div>

            <p className="mt-6 text-sm font-medium text-slate-500">
              {card.label}
            </p>

            <p className="mt-2 truncate text-3xl font-bold tracking-tight text-slate-900">
              {values[card.key]}
            </p>
          </article>
        );
      })}
    </div>
  );
}