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
    income: item.income / 100,
    expense: item.expense / 100,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Andamento finanziario
      </h2>

      <ResponsiveChartContainer minHeight={300}>
        {({ width, height }) => (
          <BarChart
            width={width}
            height={height}
            data={formattedData}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              tick={{
                fill: "#9ca3af",
                fontSize: 12,
              }}
              tickFormatter={formatMonth}
            />

            <YAxis
              stroke="#9ca3af"
              tick={{
                fill: "#9ca3af",
                fontSize: 12,
              }}
              tickFormatter={formatEuro}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                borderRadius: "8px",
                border: "1px solid #374151",
                color: "white",
              }}
              labelFormatter={(value) =>
                `Mese: ${formatMonth(value)}`
              }
              formatter={(value) => formatEuro(value)}
            />

            <Legend />

            <Bar
              dataKey="income"
              name="Entrate"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
            />

            <Bar
              dataKey="expense"
              name="Uscite"
              fill="#ef4444"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        )}
      </ResponsiveChartContainer>
    </div>
  );
}