"use client";

import {
  BarChart,
  Bar,
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

type QuarterlyBudget = {
  [quarter: string]: {
    incomeTarget: number;
    expenseTarget: number;
  };
};

function getQuarter(month: number): string {
  if (month <= 3) return "Q1";
  if (month <= 6) return "Q2";
  if (month <= 9) return "Q3";
  return "Q4";
}

export default function BudgetQuarterly({
  transactions,
  budget,
}: {
  transactions: Transaction[];
  budget: QuarterlyBudget;
}) {
  const quarterlyActual: Record<
    string,
    { income: number; expense: number }
  > = {
    Q1: { income: 0, expense: 0 },
    Q2: { income: 0, expense: 0 },
    Q3: { income: 0, expense: 0 },
    Q4: { income: 0, expense: 0 },
  };

  transactions.forEach((t) => {
    const month = new Date(t.date).getMonth() + 1;
    const quarter = getQuarter(month);

    if (t.type === "INCOME") {
      quarterlyActual[quarter].income += t.amountCents / 100;
    } else {
      quarterlyActual[quarter].expense += t.amountCents / 100;
    }
  });

  const data = Object.keys(budget).map((quarter) => ({
    quarter,
    incomeBudget: budget[quarter].incomeTarget,
    expenseBudget: budget[quarter].expenseTarget,
    incomeActual: quarterlyActual[quarter].income,
    expenseActual: quarterlyActual[quarter].expense,
    balanceActual:
      quarterlyActual[quarter].income -
      quarterlyActual[quarter].expense,
    balanceBudget:
      budget[quarter].incomeTarget -
      budget[quarter].expenseTarget,
  }));

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-lg font-semibold">Budget Trimestrale</h2>

      {/* KPI */}
      <div className="grid gap-6 sm:grid-cols-4">
        {data.map((d) => (
          <div
            key={d.quarter}
            className="rounded-xl border bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-gray-500">{d.quarter}</p>

            <p className="mt-2 text-green-600 font-bold">
              Entrate: € {d.incomeActual.toFixed(2)}
            </p>

            <p className="text-red-600 font-bold">
              Uscite: € {d.expenseActual.toFixed(2)}
            </p>

            <p
              className={`font-bold ${
                d.balanceActual >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              Bilancio: € {d.balanceActual.toFixed(2)}
            </p>

            <p className="text-gray-500 text-sm mt-2">
              Scostamento: €
              {(d.balanceActual - d.balanceBudget).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Grafico */}
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="quarter" />
            <YAxis tickFormatter={(v) => `€${v}`} />
            <Tooltip formatter={(v) => `€${v}`} />
            <Legend />

            <Bar
              dataKey="incomeBudget"
              name="Budget Entrate"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="incomeActual"
              name="Entrate Reali"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="expenseBudget"
              name="Budget Uscite"
              fill="#dc2626"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expenseActual"
              name="Uscite Reali"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
