"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  date: string;
};

// Funzione per calcolare trend lineare
function linearTrend(values: number[]) {
  const n = values.length;
  const x = [...Array(n).keys()]; // 0,1,2,3...
  const y = values;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

export default function FinanceForecast({
  transactions,
}: {
  transactions: Transaction[];
}) {
  // Raggruppa per mese
  const monthlyMap: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((t) => {
    const month = t.date.slice(0, 7);
    if (!monthlyMap[month]) {
      monthlyMap[month] = { income: 0, expense: 0 };
    }
    if (t.type === "INCOME") {
      monthlyMap[month].income += t.amountCents / 100;
    } else {
      monthlyMap[month].expense += t.amountCents / 100;
    }
  });

  const months = Object.keys(monthlyMap).sort();

  const incomeValues = months.map((m) => monthlyMap[m].income);
  const expenseValues = months.map((m) => monthlyMap[m].expense);

  const incomeTrend = linearTrend(incomeValues);
  const expenseTrend = linearTrend(expenseValues);

  // Previsioni per i prossimi 3 mesi
  const futureMonths = 3;
  const forecastData = [];

  for (let i = 0; i < futureMonths; i++) {
    const index = incomeValues.length + i;
    const forecastIncome = incomeTrend.slope * index + incomeTrend.intercept;
    const forecastExpense = expenseTrend.slope * index + expenseTrend.intercept;

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + i + 1);

    const label = `${nextMonth.getFullYear()}-${String(
      nextMonth.getMonth() + 1
    ).padStart(2, "0")}`;

    forecastData.push({
      month: label,
      incomeForecast: Math.max(forecastIncome, 0),
      expenseForecast: Math.max(forecastExpense, 0),
    });
  }

  const data = [
    ...months.map((m, i) => ({
      month: m,
      incomeActual: incomeValues[i],
      expenseActual: expenseValues[i],
    })),
    ...forecastData,
  ];

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-lg font-semibold">Previsioni Finanziarie</h2>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

            <XAxis
              dataKey="month"
              tickFormatter={(m) => m.slice(5)}
            />

            <YAxis tickFormatter={(v) => `€${v}`} />

            <Tooltip formatter={(v) => `€${v}`} />
            <Legend />

            {/* Entrate */}
            <Line
              type="monotone"
              dataKey="incomeActual"
              name="Entrate Reali"
              stroke="#16a34a"
              strokeWidth={2}
            />

            <Line
              type="monotone"
              dataKey="incomeForecast"
              name="Entrate Previste"
              stroke="#4ade80"
              strokeDasharray="5 5"
              strokeWidth={2}
            />

            {/* Uscite */}
            <Line
              type="monotone"
              dataKey="expenseActual"
              name="Uscite Reali"
              stroke="#dc2626"
              strokeWidth={2}
            />

            <Line
              type="monotone"
              dataKey="expenseForecast"
              name="Uscite Previste"
              stroke="#fca5a5"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
