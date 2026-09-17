"use client";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Scale,
} from "lucide-react";

type Props = {
  income: number;
  expense: number;
  balance: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value / 100);
}

export default function FinanceSummary({
  income,
  expense,
  balance,
}: Props) {
  const cards = [
    {
      title: "Entrate",
      description: "Totale delle entrate",
      value: formatCurrency(income),
      icon: ArrowUpCircle,
      iconClass: "text-emerald-300",
      iconBg: "bg-emerald-500/10",
      valueClass: "text-emerald-300",
    },
    {
      title: "Uscite",
      description: "Totale delle uscite",
      value: formatCurrency(expense),
      icon: ArrowDownCircle,
      iconClass: "text-red-300",
      iconBg: "bg-red-500/10",
      valueClass: "text-red-300",
    },
    {
      title: "Bilancio",
      description:
        balance >= 0
          ? "Saldo disponibile"
          : "Saldo negativo",
      value: formatCurrency(balance),
      icon: Scale,
      iconClass:
        balance >= 0
          ? "text-blue-300"
          : "text-red-300",
      iconBg:
        balance >= 0
          ? "bg-blue-500/10"
          : "bg-red-500/10",
      valueClass:
        balance >= 0
          ? "text-blue-300"
          : "text-red-300",
    },
  ];

  return (
    <section className="grid gap-5 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.title}
            className="group rounded-3xl border border-white/10 bg-[#0f172a] p-5 shadow-xl transition hover:border-white/15 hover:bg-[#111c31] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-400">
                  {card.title}
                </p>

                <p
                  className={`mt-3 break-words text-2xl font-bold sm:text-3xl ${card.valueClass}`}
                >
                  {card.value}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  {card.description}
                </p>
              </div>

              <div
                className={`shrink-0 rounded-2xl p-3 ${card.iconBg}`}
              >
                <Icon
                  size={25}
                  className={card.iconClass}
                />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}