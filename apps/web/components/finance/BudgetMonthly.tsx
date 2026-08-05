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

type MonthlyBudget = {
  [month: string]: {
    incomeTarget: number;
    expenseTarget: number;
  };
};

export default function BudgetMonthly({
  transactions,
  budget,
}: {
  transactions: Transaction[];
  budget: MonthlyBudget;
}) {
  // Raggruppa transazioni per mese
  const monthlyActual: Record<
    string,
    { income: number; expense: number }
  > = {};

  transactions.forEach((t) => {
    const month = t.date.slice(0, 7);

    if (!monthlyActual[month]) {
      monthlyActual[month] = { income: 0, expense: 0 };
    }

    if (t.type === "INCOME") {
      monthlyActual[month].income += t.amountCents / 100;
    } else {
      monthlyActual[month].expense += t.amountCents / 100;
    }
  });

  // Costruisce dataset per grafico
  const data = Object.keys(budget).map((month) => ({
    month,
    incomeBudget: budget[month].incomeTarget,
    expenseBudget: budget[month].expenseTarget,
    incomeActual: monthlyActual[month]?.income || 0,
    expenseActual: monthlyActual[month]?.expense || 0,
  }));

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-lg font-semibold">Budget Mensile</h2>

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
              dataKey="incomeBudget"
              name="Budget Entrate"
              stroke="#2563eb"
              strokeWidth={2}
            />

            <Line
              type="monotone"
              dataKey="incomeActual"
              name="Entrate Reali"
              stroke="#16a34a"
              strokeWidth={2}
            />

            {/* Uscite */}
            <Line
              type="monotone"
              dataKey="expenseBudget"
              name="Budget Uscite"
              stroke="#dc2626"
              strokeWidth={2}
            />

            <Line
              type="monotone"
              dataKey="expenseActual"
              name="Uscite Reali"
              stroke="#f97316"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
