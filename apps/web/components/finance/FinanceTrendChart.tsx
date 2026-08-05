"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type FinancePoint = {
  month: string;        // "2026-01"
  income: number;       // in euro
  expense: number;      // in euro
  balance: number;      // in euro
};

export default function FinanceTrendChart({ data }: { data: FinancePoint[] }) {
  const formatted = data.map((d) => ({
    ...d,
    income: d.income / 100,
    expense: d.expense / 100,
    balance: d.balance / 100,
  }));

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Trend Finanziario</h2>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted}>
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
            <Tooltip
              formatter={(v) => `€${v}`}
              labelFormatter={(m) => `Mese: ${m}`}
            />

            <Line
              type="monotone"
              dataKey="income"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
              name="Entrate"
            />

            <Line
              type="monotone"
              dataKey="expense"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
              name="Uscite"
            />

            <Line
              type="monotone"
              dataKey="balance"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              name="Bilancio"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
