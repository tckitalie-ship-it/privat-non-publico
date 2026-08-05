"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amountCents: number;
  date: string; // ISO date
};

export default function FinanceDonationsChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  // Raggruppa per mese
  const monthlyMap: Record<
    string,
    { donations: number; membership: number }
  > = {};

  transactions.forEach((t) => {
    if (t.type !== "INCOME") return;

    const month = t.date.slice(0, 7); // "2026-07"

    if (!monthlyMap[month]) {
      monthlyMap[month] = { donations: 0, membership: 0 };
    }

    const amount = t.amountCents / 100;

    if (t.category.toLowerCase().includes("donazione")) {
      monthlyMap[month].donations += amount;
    }

    if (
      t.category.toLowerCase().includes("quota") ||
      t.category.toLowerCase().includes("associativa")
    ) {
      monthlyMap[month].membership += amount;
    }
  });

  const data = Object.entries(monthlyMap).map(([month, values]) => ({
    month,
    donations: values.donations,
    membership: values.membership,
  }));

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">
        Donazioni vs Quote Associative
      </h2>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickFormatter={(m) => m.slice(5)} // mostra solo mese
            />

            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `€${v}`}
            />

            <Tooltip formatter={(v) => `€${v}`} />
            <Legend />

            <Line
              type="monotone"
              dataKey="donations"
              name="Donazioni"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="membership"
              name="Quote Associative"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
