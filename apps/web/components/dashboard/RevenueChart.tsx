"use client";

import ResponsiveChartContainer from "@/components/dashboard/ResponsiveChartContainer";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RevenuePoint = {
  month: string;
  income: number;
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
    return "€ 0,00";
  }

  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

function normalizeData(data: RevenuePoint[]) {
  return data
    .map((item) => ({
      month: String(item.month),
      income: Number(item.income) / 100,
    }))
    .filter(
      (item) =>
        item.month.trim().length > 0 &&
        Number.isFinite(item.income),
    )
    .sort((first, second) =>
      first.month.localeCompare(second.month),
    );
}

export default function RevenueChart({
  data,
}: {
  data: RevenuePoint[];
}) {
  const formattedData = normalizeData(data);

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          Finanze
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Entrate mensili
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Andamento delle entrate registrate mese per mese.
        </p>
      </div>

      {formattedData.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <div>
            <p className="font-medium text-slate-700">
              Nessun dato sulle entrate disponibile
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Le entrate registrate appariranno qui quando saranno
              disponibili.
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveChartContainer minHeight={320}>
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
                axisLine={{
                  stroke: "#e2e8f0",
                }}
                tickLine={false}
                tickFormatter={formatMonth}
                minTickGap={24}
              />

              <YAxis
                stroke="#94a3b8"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
                width={80}
                tickFormatter={formatEuro}
              />

              <Tooltip
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
                  marginBottom: "4px",
                }}
                itemStyle={{
                  color: "#2563eb",
                }}
                cursor={{
                  fill: "#f8fafc",
                }}
                labelFormatter={(value) =>
                  `Mese: ${formatMonth(value)}`
                }
                formatter={(value) => formatEuro(value)}
              />

              <Bar
                dataKey="income"
                name="Entrate"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
                animationDuration={800}
                maxBarSize={44}
              />
            </BarChart>
          )}
        </ResponsiveChartContainer>
      )}
    </section>
  );
}