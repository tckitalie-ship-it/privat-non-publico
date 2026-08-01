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

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amountCents: number;
};

export default function FinanceCategoryChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  // Raggruppa per categoria
  const categoriesMap: Record<
    string,
    { income: number; expense: number }
  > = {};

  transactions.forEach((t) => {
    if (!categoriesMap[t.category]) {
      categoriesMap[t.category] = { income: 0, expense: 0 };
    }

    if (t.type === "INCOME") {
      categoriesMap[t.category].income += t.amountCents / 100;
    } else {
      categoriesMap[t.category].expense += t.amountCents / 100;
    }
  });

  const data = Object.entries(categoriesMap).map(([category, values]) => ({
    category,
    income: values.income,
    expense: values.expense,
  }));

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Finanze per Categoria</h2>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

            <XAxis
              dataKey="category"
              tick={{ fontSize: 12 }}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `€${v}`}
            />

            <Tooltip formatter={(v) => `€${v}`} />
            <Legend />

            <Bar
              dataKey="income"
              name="Entrate"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="expense"
              name="Uscite"
              fill="#dc2626"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
