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

export default function MembersTrendChart({
  data,
}: MembersTrendChartProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Crescita membri
      </h2>

      <ResponsiveChartContainer minHeight={300}>
        {({ width, height }) => (
          <AreaChart
            width={width}
            height={height}
            data={data}
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
              allowDecimals={false}
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
            />

            <Area
              type="monotone"
              dataKey="count"
              name="Membri"
              stroke="#10b981"
              fill="#10b98133"
              strokeWidth={3}
            />
          </AreaChart>
        )}
      </ResponsiveChartContainer>
    </div>
  );
}