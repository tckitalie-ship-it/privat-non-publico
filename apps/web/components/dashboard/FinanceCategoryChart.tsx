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
  category: string | null;
  amountCents: number;
};

type CategoryData = {
  category: string;
  income: number;
  expense: number;
};

function formatEuro(value: unknown) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

function formatCategory(value: string) {
  if (!value) {
    return "Senza categoria";
  }

  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function FinanceCategoryChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const categoriesMap: Record<
    string,
    { income: number; expense: number }
  > = {};

  for (const transaction of transactions) {
    const category =
      transaction.category?.trim() || "Senza categoria";

    if (!categoriesMap[category]) {
      categoriesMap[category] = {
        income: 0,
        expense: 0,
      };
    }

    const amount = Number(transaction.amountCents);

    if (!Number.isFinite(amount)) {
      continue;
    }

    if (transaction.type === "INCOME") {
      categoriesMap[category].income += amount / 100;
    } else {
      categoriesMap[category].expense += amount / 100;
    }
  }

  const data: CategoryData[] = Object.entries(categoriesMap)
    .map(([category, values]) => ({
      category: formatCategory(category),
      income: values.income,
      expense: values.expense,
    }))
    .sort(
      (a, b) =>
        b.income +
        b.expense -
        (a.income + a.expense),
    );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Finanze per categoria
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Confronto tra entrate e uscite per categoria.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[350px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-500">
            Nessun movimento finanziario disponibile.
          </p>
        </div>
      ) : (
        <div className="h-[350px] min-w-0">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
          >
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
              />

              <XAxis
                dataKey="category"
                stroke="#9ca3af"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickLine={false}
                axisLine={{
                  stroke: "#e5e7eb",
                }}
                interval={0}
                angle={data.length > 5 ? -25 : 0}
                textAnchor={
                  data.length > 5 ? "end" : "middle"
                }
                height={data.length > 5 ? 65 : 30}
              />

              <YAxis
                stroke="#9ca3af"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatEuro}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  boxShadow:
                    "0 10px 25px rgba(15, 23, 42, 0.08)",
                }}
                labelStyle={{
                  color: "#0f172a",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
                formatter={(value) => formatEuro(value)}
                labelFormatter={(value) =>
                  `Categoria: ${value}`
                }
              />

              <Legend />

              <Bar
                dataKey="income"
                name="Entrate"
                fill="#16a34a"
                radius={[5, 5, 0, 0]}
                maxBarSize={42}
              />

              <Bar
                dataKey="expense"
                name="Uscite"
                fill="#dc2626"
                radius={[5, 5, 0, 0]}
                maxBarSize={42}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}