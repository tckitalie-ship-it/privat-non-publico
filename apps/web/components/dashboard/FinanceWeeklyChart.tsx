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

// Funzione per ottenere la settimana ISO (es: 2026-W27)
function getISOWeek(dateString: string) {
  const date = new Date(dateString);
  const year = date.getFullYear();

  // Calcolo settimana ISO
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));

  const weekNumber = Math.ceil(
    ((tempDate.getTime() - new Date(tempDate.getFullYear(), 0, 1).getTime()) /
      86400000 +
      1) /
      7
  );

  return `${year}-W${weekNumber}`;
}

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  date: string; // ISO date
};

export default function FinanceWeeklyChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  // Raggruppa per settimana
  const weeklyMap: Record<
    string,
    { income: number; expense: number; balance: number }
  > = {};

  transactions.forEach((t) => {
    const week = getISOWeek(t.date);

    if (!weeklyMap[week]) {
      weeklyMap[week] = { income: 0, expense: 0, balance: 0 };
    }

    if (t.type === "INCOME") {
      weeklyMap[week].income += t.amountCents / 100;
    } else {
      weeklyMap[week].expense += t.amountCents / 100;
    }

    weeklyMap[week].balance =
      weeklyMap[week].income - weeklyMap[week].expense;
  });

  const data = Object.entries(weeklyMap).map(([week, values]) => ({
    week,
    income: values.income,
    expense: values.expense,
    balance: values.balance,
  }));

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Trend Settimanale</h2>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

            <XAxis
              dataKey="week"
              tick={{ fontSize: 12 }}
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
