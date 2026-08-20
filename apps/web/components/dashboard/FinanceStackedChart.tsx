"use client";

import ResponsiveChartContainer from "@/components/dashboard/ResponsiveChartContainer";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type FinancePoint = {
  month: string;
  income: number;
  expense: number;
};

function formatMonth(value: unknown) {
  const month = String(value);

  if (/^\d{4}-\d{2}$/.test(month)) {
    const [year, monthNumber] = month.split("-");

    return `${monthNumber}/${year}`;
  }

  return month;
}

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

export default function FinanceStackedChart({
  data,
}: {
  data: FinancePoint[];
}) {
  const formatted = data
    .map((item) => ({
      month: item.month,
      income: Number(item.income) / 100,
      expense: Number(item.expense) / 100,
    }))
    .filter(
      (item) =>
        Number.isFinite(item.income) &&
        Number.isFinite(item.expense),
    );

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          Finanze
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Entrate vs uscite
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Confronto mensile tra entrate e uscite in modalità
          cumulativa.
        </p>
      </div>

      {formatted.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <div>
            <p className="font-medium text-slate-700">
              Nessun dato finanziario disponibile
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Le transazioni appariranno qui quando saranno
              registrate.
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveChartContainer minHeight={320}>
          {({ width, height }) => (
            <BarChart
              width={width}
              height={height}
              data={formatted}
              margin={{
                top: 8,
                right: 12,
                left: 8,
                bottom: 8,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickFormatter={formatMonth}
                tickLine={false}
                axisLine={{
                  stroke: "#e2e8f0",
                }}
                minTickGap={24}
              />

              <YAxis
                stroke="#94a3b8"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickFormatter={formatEuro}
                tickLine={false}
                axisLine={false}
                width={80}
              />

              <Tooltip
                cursor={{
                  fill: "#f8fafc",
                }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 10px 25px rgba(15, 23, 42, 0.10)",
                }}
                labelStyle={{
                  color: "#0f172a",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
                itemStyle={{
                  color: "#334155",
                }}
                labelFormatter={(value) =>
                  `Mese: ${formatMonth(value)}`
                }
                formatter={(value, name) => [
                  formatEuro(value),
                  name,
                ]}
              />

              <Legend
                wrapperStyle={{
                  paddingTop: "16px",
                }}
              />

              <Bar
                dataKey="income"
                name="Entrate"
                stackId="finance"
                fill="#16a34a"
                radius={[5, 5, 0, 0]}
                maxBarSize={48}
              />

              <Bar
                dataKey="expense"
                name="Uscite"
                stackId="finance"
                fill="#dc2626"
                radius={[5, 5, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          )}
        </ResponsiveChartContainer>
      )}
    </section>
  );
}