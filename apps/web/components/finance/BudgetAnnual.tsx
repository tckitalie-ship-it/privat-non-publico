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

type Budget = {
  year: number;
  incomeTarget: number;   // euro
  expenseTarget: number;  // euro
};

export default function BudgetAnnual({
  transactions,
  budget,
}: {
  transactions: Transaction[];
  budget: Budget;
}) {
  const year = budget.year;

  // Filtra transazioni dell'anno
  const yearly = transactions.filter((t) =>
    t.date.startsWith(String(year))
  );

  const incomeActual = yearly
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amountCents, 0) / 100;

  const expenseActual = yearly
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amountCents, 0) / 100;

  const incomeVariance = incomeActual - budget.incomeTarget;
  const expenseVariance = budget.expenseTarget - expenseActual;

  const data = [
    {
      name: "Entrate",
      Budget: budget.incomeTarget,
      Reale: incomeActual,
    },
    {
      name: "Uscite",
      Budget: budget.expenseTarget,
      Reale: expenseActual,
    },
  ];

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-lg font-semibold">
        Budget Annuale {year}
      </h2>

      {/* KPI */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Kpi label="Budget Entrate" value={budget.incomeTarget} color="text-green-600" />
        <Kpi label="Entrate Reali" value={incomeActual} color="text-green-600" />
        <Kpi
          label="Scostamento Entrate"
          value={incomeVariance}
          color={incomeVariance >= 0 ? "text-blue-600" : "text-red-600"}
        />

        <Kpi label="Budget Uscite" value={budget.expenseTarget} color="text-red-600" />
        <Kpi label="Uscite Reali" value={expenseActual} color="text-red-600" />
        <Kpi
          label="Scostamento Uscite"
          value={expenseVariance}
          color={expenseVariance >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

      {/* Grafico */}
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => `€${v}`} />
            <Tooltip formatter={(v) => `€${v}`} />
            <Legend />

            <Bar dataKey="Budget" fill="#2563eb" name="Budget" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Reale" fill="#16a34a" name="Reale" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>
        € {value.toFixed(2)}
      </p>
    </div>
  );
}
