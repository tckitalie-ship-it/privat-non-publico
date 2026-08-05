"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface FinanceChartItem {
  month: string;
  income: number;
  expenses: number;
}

interface FinanceChartProps {
  data: FinanceChartItem[];
}

export default function FinanceChart({
  data,
}: FinanceChartProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          Andamento Finanziario
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Confronto mensile tra entrate e uscite.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[360px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#111827] text-gray-400">
          Nessun dato disponibile.
        </div>
      ) : (
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
              />

              <XAxis
                dataKey="month"
                stroke="#9CA3AF"
              />

              <YAxis stroke="#9CA3AF" />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="income"
                fill="#22c55e"
                radius={[6, 6, 0, 0]}
                name="Entrate"
              />

              <Bar
                dataKey="expenses"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
                name="Uscite"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}