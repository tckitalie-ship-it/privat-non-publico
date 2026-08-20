"use client";

import { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ResponsiveChartContainer from "@/components/dashboard/ResponsiveChartContainer";

type ChartData = Record<string, unknown>;

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
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
    return "€ 0,00";
  }

  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

function formatNumber(value: unknown) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return new Intl.NumberFormat("it-IT").format(number);
}

function EmptyChart({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

function RevenueChartContent({
  data,
}: {
  data: ChartData[];
}) {
  return (
    <ResponsiveChartContainer minHeight={320}>
      {({ width, height }) => (
        <LineChart
          width={width}
          height={height}
          data={data}
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
              stroke: "#94a3b8",
              strokeDasharray: "4 4",
            }}
            labelFormatter={(value) =>
              `Mese: ${formatMonth(value)}`
            }
            formatter={(value) => formatEuro(value)}
          />

          <Line
            type="monotone"
            dataKey="income"
            name="Entrate"
            stroke="#2563eb"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      )}
    </ResponsiveChartContainer>
  );
}

export function RevenueChart({
  data = [],
}: {
  data?: ChartData[];
}) {
  return (
    <ChartCard
      title="Entrate mensili"
      description="Andamento delle entrate registrate."
    >
      {data.length === 0 ? (
        <EmptyChart message="Nessun dato sulle entrate disponibile." />
      ) : (
        <RevenueChartContent data={data} />
      )}
    </ChartCard>
  );
}

export function FinanceChart({
  data = [],
}: {
  data?: ChartData[];
}) {
  return (
    <ChartCard
      title="Entrate vs Uscite"
      description="Confronto mensile delle operazioni finanziarie."
    >
      {data.length === 0 ? (
        <EmptyChart message="Nessun dato finanziario disponibile." />
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
                  color: "#334155",
                }}
                cursor={{
                  fill: "#f8fafc",
                }}
                labelFormatter={(value) =>
                  `Mese: ${formatMonth(value)}`
                }
                formatter={(value) => formatEuro(value)}
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
    </ChartCard>
  );
}

export function MembersTrendChart({
  data = [],
}: {
  data?: ChartData[];
}) {
  return (
    <ChartCard
      title="Crescita membri"
      description="Andamento mensile del numero di membri."
    >
      {data.length === 0 ? (
        <EmptyChart message="Nessun dato membri disponibile." />
      ) : (
        <ResponsiveChartContainer minHeight={320}>
          {({ width, height }) => (
            <LineChart
              width={width}
              height={height}
              data={data}
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
                tickFormatter={formatNumber}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                width={60}
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
                  color: "#059669",
                }}
                cursor={{
                  stroke: "#94a3b8",
                  strokeDasharray: "4 4",
                }}
                labelFormatter={(value) =>
                  `Mese: ${formatMonth(value)}`
                }
                formatter={(value) => [
                  formatNumber(value),
                  "Membri",
                ]}
              />

              <Line
                type="monotone"
                dataKey="count"
                name="Membri"
                stroke="#059669"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          )}
        </ResponsiveChartContainer>
      )}
    </ChartCard>
  );
}