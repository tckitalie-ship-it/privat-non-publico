"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

type FinancePoint = {
  month: string;        // "2026-01"
  income: number;       // in centesimi
  expense: number;      // in centesimi
};

export default function FinanceStackedChart({ data }: { data: FinancePoint[] }) {
  const formatted = data.map((d) => ({
    ...d,
    income: d.income / 100,
    expense: d.expense / 100,
  }));

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Entrate vs Uscite (Stacked)</h2>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatted}>
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

            {/* Entrate */}
            <Bar
              dataKey="income"
              name="Entrate"
              stackId="finance"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
            />

            {/* Uscite */}
            <Bar
              dataKey="expense"
              name="Uscite"
              stackId="finance"
              fill="#dc2626"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
