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

interface FinanceTrendChartProps {
  data: {
    month: string;
    income: number;
    expense: number;
  }[];
}

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
    return "0,00 €";
  }

  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

function normalizeData(
  data: FinanceTrendChartProps["data"],
): FinancePoint[] {
  return data
    .map((item) => ({
      month: String(item.month),
      income: Number(item.income) / 100,
      expense: Number(item.expense) / 100,
    }))
    .filter(
      (item) =>
        item.month.trim().length > 0 &&
        Number.isFinite(item.income) &&
        Number.isFinite(item.expense),
    )
    .sort((first, second) =>
      first.month.localeCompare(second.month),
    );
}

export default function FinanceTrendChart({
  data,
}: FinanceTrendChartProps) {
  const formattedData = normalizeData(data);

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          Finanze
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Andamento finanziario
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Confronto mensile tra entrate e uscite.
        </p>
      </div>

      {formattedData.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <div>
            <p className="font-medium text-slate-700">
              Nessun dato disponibile
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Registra entrate o uscite per visualizzare
              l&apos;andamento finanziario.
            </p>
          </div>
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
                stroke="#94a3b8"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickFormatter={formatMonth}
                axisLine={{
                  stroke: "#e2e8f0",
                }}
                tickLine={false}
                minTickGap={24}
              />

              <YAxis
                stroke="#94a3b8"
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