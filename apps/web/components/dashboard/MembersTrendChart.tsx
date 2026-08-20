"use client";

import ResponsiveChartContainer from "@/components/dashboard/ResponsiveChartContainer";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MembersTrendChartProps {
  data: {
    month: string;
    count: number;
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

function formatMembers(value: unknown) {
  const count = Number(value);

  if (!Number.isFinite(count)) {
    return "0";
  }

  return new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(count)));
}

function normalizeData(
  data: MembersTrendChartProps["data"],
) {
  return data
    .map((item) => ({
      month: String(item.month),
      count: Number(item.count),
    }))
    .filter(
      (item) =>
        item.month.trim().length > 0 &&
        Number.isFinite(item.count),
    )
    .sort((first, second) =>
      first.month.localeCompare(second.month),
    );
}

export default function MembersTrendChart({
  data,
}: MembersTrendChartProps) {
  const formattedData = normalizeData(data);

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Membri
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Crescita membri
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Andamento mensile del numero cumulativo di membri.
        </p>
      </div>

      {formattedData.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <div>
            <p className="font-medium text-slate-700">
              Nessun dato disponibile
            </p>

            <p className="mt-1 text-sm text-slate-500">
              I dati saranno visualizzati quando saranno
              disponibili membri associati.
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveChartContainer minHeight={300}>
          {({ width, height }) => (
            <AreaChart
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
              <defs>
                <linearGradient
                  id="membersTrendGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#10b981"
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor="#10b981"
                    stopOpacity={0.03}
                  />
                </linearGradient>
              </defs>

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
                tickFormatter={formatMembers}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                width={55}
              />

              <Tooltip
                cursor={{
                  stroke: "#94a3b8",
                  strokeDasharray: "4 4",
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
                  color: "#047857",
                }}
                labelFormatter={(value) =>
                  `Mese: ${formatMonth(value)}`
                }
                formatter={(value) => [
                  formatMembers(value),
                  "Membri",
                ]}
              />

              <Area
                type="monotone"
                dataKey="count"
                name="Membri"
                stroke="#059669"
                fill="url(#membersTrendGradient)"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          )}
        </ResponsiveChartContainer>
      )}
    </section>
  );
}