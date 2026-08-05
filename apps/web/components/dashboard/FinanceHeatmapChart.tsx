"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  date: string; // ISO date
};

export default function FinanceHeatmapChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  // Raggruppa per giorno
  const dailyMap: Record<string, number> = {};

  transactions.forEach((t) => {
    const day = t.date.split("T")[0]; // "2026-07-07"

    if (!dailyMap[day]) {
      dailyMap[day] = 0;
    }

    // Somma entrate e uscite (in euro)
    dailyMap[day] += t.amountCents / 100;
  });

  // Converte in array per Recharts
  const data = Object.entries(dailyMap).map(([day, value]) => {
    const d = new Date(day);
    return {
      day,
      value,
      month: d.getMonth() + 1,
      dayOfMonth: d.getDate(),
    };
  });

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Heatmap Finanziaria</h2>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

            <XAxis
              type="number"
              dataKey="month"
              name="Mese"
              tick={{ fontSize: 12 }}
              domain={[1, 12]}
              tickFormatter={(m) => `M${m}`}
            />

            <YAxis
              type="number"
              dataKey="dayOfMonth"
              name="Giorno"
              tick={{ fontSize: 12 }}
              domain={[1, 31]}
            />

            <ZAxis
              type="number"
              dataKey="value"
              range={[50, 400]} // dimensione del punto
            />

            <Tooltip
              formatter={(v) => `€${v}`}
              labelFormatter={() => ""}
            />

            <Scatter
              data={data}
              fill="#2563eb"
              opacity={0.8}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
