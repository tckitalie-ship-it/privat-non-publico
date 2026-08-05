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
      value: formatCurrency(income),
      icon: ArrowUpCircle,
      iconClass: "text-emerald-400",
      valueClass: "text-emerald-400",
    },
    {
      title: "Uscite",
      value: formatCurrency(expense),
      icon: ArrowDownCircle,
      iconClass: "text-red-400",
      valueClass: "text-red-400",
    },
    {
      title: "Bilancio",
      value: formatCurrency(balance),
      icon: Scale,
      iconClass:
        balance >= 0
          ? "text-blue-400"
          : "text-red-400",
      valueClass:
        balance >= 0
          ? "text-blue-400"
          : "text-red-400",
    },
  ];

  return (
    <section className="grid gap-5 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.title}
            className="rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  {card.title}
                </p>

                <p
                  className={`mt-3 text-3xl font-bold ${card.valueClass}`}
                >
                  {card.value}
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-3">
                <Icon
                  size={24}
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