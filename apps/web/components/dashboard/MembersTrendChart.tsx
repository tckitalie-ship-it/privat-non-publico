"use client";

import ResponsiveChartContainer from "@/components/dashboard/ResponsiveChartContainer";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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
    return String(value);
  }

  return new Intl.NumberFormat("it-IT").format(count);
}

export default function MembersTrendChart({
  data,
}: MembersTrendChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    count: Number(item.count) || 0,
  }));

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Crescita membri
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Andamento mensile del numero di membri.
        </p>
      </div>

      {formattedData.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-500">
            Nessun dato membri disponibile.
          </p>
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
                  formatMembers(value)
                }
              />

              <Area
                type="monotone"
                dataKey="count"
                name="Membri"
                stroke="#059669"
                fill="#10b981"
                fillOpacity={0.14}
                strokeWidth={3}
                activeDot={{
                  r: 5,
                }}
              />
            </AreaChart>
          )}
        </ResponsiveChartContainer>
      )}
    </section>
  );
}