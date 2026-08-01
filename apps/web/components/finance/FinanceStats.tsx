"use client";

import {
  TrendingUp,
  TrendingDown,
  Receipt,
  PiggyBank,
} from "lucide-react";

interface FinanceStatsProps {
  incomeTransactions: number;
  expenseTransactions: number;
  totalTransactions: number;
  monthlyBalance: number;
}

export default function FinanceStats({
  incomeTransactions,
  expenseTransactions,
  totalTransactions,
  monthlyBalance,
}: FinanceStatsProps) {
  const cards = [
    {
      title: "Entrate",
      value: incomeTransactions,
      icon: TrendingUp,
      color: "text-emerald-300",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Uscite",
      value: expenseTransactions,
      icon: TrendingDown,
      color: "text-red-300",
      bg: "bg-red-500/10",
    },
    {
      title: "Movimenti",
      value: totalTransactions,
      icon: Receipt,
      color: "text-indigo-300",
      bg: "bg-indigo-500/10",
    },
    {
      title: "Saldo mese",
      value: `€ ${monthlyBalance.toFixed(2)}`,
      icon: PiggyBank,
      color: "text-cyan-300",
      bg: "bg-cyan-500/10",
    },
  ];

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl transition hover:border-emerald-500/40"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {card.title}
                </p>

                <h3 className="mt-3 text-3xl font-bold text-white">
                  {card.value}
                </h3>
              </div>

              <div className={`rounded-2xl p-4 ${card.bg}`}>
                <Icon className={`h-7 w-7 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}