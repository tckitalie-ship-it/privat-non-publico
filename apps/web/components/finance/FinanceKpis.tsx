"use client";

import { useMemo } from "react";
import {
  CalendarDays,
  ChartNoAxesCombined,
  CircleDollarSign,
  HandHeart,
  ReceiptText,
  Tags,
  Users,
} from "lucide-react";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  category?: string | null;
  amountCents: number;
  date: string;
};

type MonthlyTotals = {
  income: number;
  expense: number;
};

type Kpi = {
  label: string;
  value: string;
  description: string;
  icon: typeof ChartNoAxesCombined;
  valueClass?: string;
};

function getMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(
    date.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
}

function getPreviousMonthKey(monthKey: string) {
  const [year, month] = monthKey
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(year, month - 2, 1),
  );

  return getMonthKey(date);
}

function calculateGrowth(
  currentValue: number,
  previousValue: number,
): number | null {
  if (previousValue === 0) {
    return null;
  }

  return (
    ((currentValue - previousValue) /
      previousValue) *
    100
  );
}

function formatPercentage(value: number | null) {
  if (value === null) {
    return "N/D";
  }

  const prefix = value > 0 ? "+" : "";

  return `${prefix}${value.toFixed(1)}%`;
}

function formatDate(day: string | null) {
  if (!day) {
    return "Non disponibile";
  }

  const [year, month, date] = day
    .split("-")
    .map(Number);

  if (!year || !month || !date) {
    return "Non disponibile";
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(
    new Date(Date.UTC(year, month - 1, date)),
  );
}

export default function FinanceKpis({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const kpis = useMemo<Kpi[]>(() => {
    const monthlyTotals: Record<
      string,
      MonthlyTotals
    > = {};

    const dailyTotals: Record<
      string,
      number
    > = {};

    const categoryTotals: Record<
      string,
      number
    > = {};

    let totalIncome = 0;
    let donations = 0;
    let memberships = 0;

    for (const transaction of transactions) {
      const date = new Date(transaction.date);

      if (Number.isNaN(date.getTime())) {
        continue;
      }

      const monthKey = getMonthKey(date);
      const dayKey = date
        .toISOString()
        .slice(0, 10);

      monthlyTotals[monthKey] ??= {
        income: 0,
        expense: 0,
      };

      if (transaction.type === "INCOME") {
        monthlyTotals[monthKey].income +=
          transaction.amountCents;

        totalIncome += transaction.amountCents;
      } else {
        monthlyTotals[monthKey].expense +=
          transaction.amountCents;
      }

      dailyTotals[dayKey] =
        (dailyTotals[dayKey] ?? 0) +
        transaction.amountCents;

      const category =
        transaction.category?.trim() ||
        "Senza categoria";

      categoryTotals[category] =
        (categoryTotals[category] ?? 0) +
        transaction.amountCents;

      if (transaction.type !== "INCOME") {
        continue;
      }

      const normalizedCategory =
        category.toLocaleLowerCase("it-IT");

      if (
        normalizedCategory.includes(
          "donazione",
        )
      ) {
        donations += transaction.amountCents;
      }

      if (
        normalizedCategory.includes("quota") ||
        normalizedCategory.includes(
          "associativa",
        )
      ) {
        memberships +=
          transaction.amountCents;
      }
    }

    const availableMonths = Object.keys(
      monthlyTotals,
    ).sort();

    const latestMonth =
      availableMonths.at(-1) ?? null;

    const previousMonth = latestMonth
      ? getPreviousMonthKey(latestMonth)
      : null;

    const latestTotals = latestMonth
      ? monthlyTotals[latestMonth]
      : undefined;

    const previousTotals = previousMonth
      ? monthlyTotals[previousMonth]
      : undefined;

    const incomeGrowth = calculateGrowth(
      latestTotals?.income ?? 0,
      previousTotals?.income ?? 0,
    );

    const expenseGrowth = calculateGrowth(
      latestTotals?.expense ?? 0,
      previousTotals?.expense ?? 0,
    );

    const donationPercentage =
      totalIncome > 0
        ? (donations / totalIncome) * 100
        : 0;

    const membershipPercentage =
      totalIncome > 0
        ? (memberships / totalIncome) * 100
        : 0;

    const mostActiveDay =
      Object.entries(dailyTotals).sort(
        ([, firstTotal], [, secondTotal]) =>
          secondTotal - firstTotal,
      )[0]?.[0] ?? null;

    const mostActiveCategory =
      Object.entries(categoryTotals).sort(
        ([, firstTotal], [, secondTotal]) =>
          secondTotal - firstTotal,
      )[0]?.[0] ?? "Non disponibile";

    return [
      {
        label: "Crescita entrate",
        value: formatPercentage(incomeGrowth),
        description:
          "Rispetto al mese precedente",
        icon: ChartNoAxesCombined,
        valueClass:
          incomeGrowth === null
            ? "text-slate-200"
            : incomeGrowth >= 0
              ? "text-emerald-300"
              : "text-red-300",
      },
      {
        label: "Crescita uscite",
        value: formatPercentage(expenseGrowth),
        description:
          "Rispetto al mese precedente",
        icon: CircleDollarSign,
        valueClass:
          expenseGrowth === null
            ? "text-slate-200"
            : expenseGrowth <= 0
              ? "text-emerald-300"
              : "text-red-300",
      },
      {
        label: "Donazioni",
        value: `${donationPercentage.toFixed(1)}%`,
        description:
          "Percentuale sulle entrate totali",
        icon: HandHeart,
      },
      {
        label: "Quote associative",
        value: `${membershipPercentage.toFixed(1)}%`,
        description:
          "Percentuale sulle entrate totali",
        icon: Users,
      },
      {
        label: "Transazioni",
        value: transactions.length.toLocaleString(
          "it-IT",
        ),
        description:
          "Movimenti finanziari registrati",
        icon: ReceiptText,
      },
      {
        label: "Giorno più attivo",
        value: formatDate(mostActiveDay),
        description:
          "Giorno con il maggiore volume",
        icon: CalendarDays,
      },
      {
        label: "Categoria più attiva",
        value: mostActiveCategory,
        description:
          "Categoria con il maggiore volume",
        icon: Tags,
      },
    ];
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#0f172a] p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/5 p-3">
            <ChartNoAxesCombined
              size={22}
              className="text-slate-400"
            />
          </div>

          <div>
            <p className="font-semibold text-white">
              Indicatori non disponibili
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Registra almeno una transazione
              per visualizzare le statistiche.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">
          Indicatori finanziari
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Analisi sintetica dei movimenti
          registrati.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <article
              key={kpi.label}
              className="rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-slate-400">
                    {kpi.label}
                  </p>

                  <p
                    className={`mt-2 break-words text-2xl font-bold ${
                      kpi.valueClass ??
                      "text-white"
                    }`}
                  >
                    {kpi.value}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {kpi.description}
                  </p>
                </div>

                <div className="shrink-0 rounded-xl bg-white/5 p-3">
                  <Icon
                    size={22}
                    className="text-blue-300"
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}