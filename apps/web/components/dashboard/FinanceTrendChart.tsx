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

interface FinanceTrendChartProps {
  data: {
    month: string;
    income: number;
    expense: number;
  }[];
}

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

export default function FinanceTrendChart({
  data,
}: FinanceTrendChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    income: Number(item.income) / 100,
    expense: Number(item.expense) / 100,
  }));

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Andamento finanziario
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Confronto mensile tra entrate e uscite.
        </p>
      </div>

      {formattedData.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-500">
            Nessun dato finanziario disponibile.
          </p>
        </div>
      ) : (
        <ResponsiveChartContainer minHeight={300}>
          {({ width, height }) => (
            <BarChart
              width={width}
              height={height}
              data={formattedData}
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
                stroke="#9ca3af"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickFormatter={formatMonth}
                axisLine={{
                  stroke: "#e2e8f0",
                }}
                tickLine={false}
              />

              <YAxis
                stroke="#9ca3af"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickFormatter={formatEuro}
                axisLine={false}
                tickLine={false}
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
                formatter={(value) =>
                  formatEuro(value)
                }
              />

              <Legend
                wrapperStyle={{
                  paddingTop: "16px",
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