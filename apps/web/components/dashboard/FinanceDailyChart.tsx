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
  amountCents: number;
  date: string; // ISO date
};

export default function FinanceDailyChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  // Raggruppa per giorno
  const dailyMap: Record<
    string,
    { income: number; expense: number; balance: number }
  > = {};

  transactions.forEach((t) => {
    const day = t.date.split("T")[0]; // "2026-07-07"

    if (!dailyMap[day]) {
      dailyMap[day] = { income: 0, expense: 0, balance: 0 };
    }

    if (t.type === "INCOME") {
      dailyMap[day].income += t.amountCents / 100;
    } else {
      dailyMap[day].expense += t.amountCents / 100;
    }

    dailyMap[day].balance =
      dailyMap[day].income - dailyMap[day].expense;
  });

  const data = Object.entries(dailyMap).map(([day, values]) => ({
    day,
    income: values.income,
    expense: values.expense,
    balance: values.balance,
  }));

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Trend Giornaliero</h2>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

            <XAxis
              dataKey="day"
              tick={{ fontSize: 12 }}
              tickFormatter={(d) => d.slice(5)} // mostra solo MM-DD
            />

            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `€${v}`}
            />

            <Tooltip formatter={(v) => `€${v}`} />
            <Legend />

            <Line
              type="monotone"
              dataKey="income"
              name="Entrate"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="expense"
              name="Uscite"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="balance"
              name="Bilancio"
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
