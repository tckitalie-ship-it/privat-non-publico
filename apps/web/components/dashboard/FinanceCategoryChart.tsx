"use client";

import ResponsiveChartContainer from "@/components/dashboard/ResponsiveChartContainer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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
    return "€ 0,00";
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

function buildData(transactions: Transaction[]): CategoryData[] {
  const categoriesMap = new Map<
    string,
    {
      income: number;
      expense: number;
    }
  >();

  for (const transaction of transactions) {
    const amount = Number(transaction.amountCents);

    if (!Number.isFinite(amount)) {
      continue;
    }

    const category =
      transaction.category?.trim() || "Senza categoria";

    const current = categoriesMap.get(category) ?? {
      income: 0,
      expense: 0,
    };

    if (transaction.type === "INCOME") {
      current.income += amount / 100;
    } else {
      current.expense += amount / 100;
    }

    categoriesMap.set(category, current);
  }

  return Array.from(categoriesMap.entries())
    .map(([category, values]) => ({
      category: formatCategory(category),
      income: values.income,
      expense: values.expense,
    }))
    .sort(
      (first, second) =>
        second.income +
        second.expense -
        (first.income + first.expense),
    );
}

export default function FinanceCategoryChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const data = buildData(transactions);

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          Finanze
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Finanze per categoria
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Confronto tra entrate e uscite per categoria.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <div>
            <p className="font-medium text-slate-700">
              Nessun movimento finanziario disponibile
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Registra un movimento finanziario per visualizzare
              il confronto per categoria.
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveChartContainer minHeight={320}>
          {({ width, height }) => (
            <BarChart
              width={width}
              height={height}
              data={data}
              margin={{
                top: 8,
                right: 12,
                left: 8,
                bottom: data.length > 5 ? 24 : 8,
              }}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />

              <XAxis
                dataKey="category"
                stroke="#94a3b8"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickLine={false}
                axisLine={{
                  stroke: "#e2e8f0",
                }}
                interval={0}
                angle={data.length > 5 ? -25 : 0}
                textAnchor={
                  data.length > 5 ? "end" : "middle"
                }
                height={data.length > 5 ? 65 : 30}
              />

              <YAxis
                stroke="#94a3b8"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatEuro}
                width={80}
              />

              <Tooltip
                cursor={{
                  fill: "#f8fafc",
                }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow:
                    "0 10px 25px rgba(15, 23, 42, 0.10)",
                }}
                labelStyle={{
                  color: "#0f172a",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
                itemStyle={{
                  color: "#334155",
                }}
                formatter={(value, name) => [
                  formatEuro(value),
                  name,
                ]}
                labelFormatter={(value) =>
                  `Categoria: ${value}`
                }
              />

              <Legend
                wrapperStyle={{
                  paddingTop: 12,
                }}
              />

              <Bar
                dataKey="income"
                name="Entrate"
                fill="#16a34a"
                radius={[6, 6, 0, 0]}
                maxBarSize={42}
              />

              <Bar
                dataKey="expense"
                name="Uscite"
                fill="#dc2626"
                radius={[6, 6, 0, 0]}
                maxBarSize={42}
              />
            </BarChart>
          )}
        </ResponsiveChartContainer>
      )}
    </section>
  );
}