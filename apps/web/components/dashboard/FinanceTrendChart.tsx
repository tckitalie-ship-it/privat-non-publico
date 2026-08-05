"use client";

import ResponsiveChartContainer from "@/components/dashboard/ResponsiveChartContainer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface FinanceTrendChartProps {
  data: {
  month: string;
  income: number;
  expense: number;
}[];
}

export default function FinanceTrendChart({ data }: FinanceTrendChartProps) {
  return (
    <ResponsiveChartContainer minHeight={300}>
      {({ width, height }) => (
        <BarChart width={width} height={height} data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="month"
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />

          <YAxis
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              borderRadius: "8px",
              border: "1px solid #374151",
              color: "white",
            }}
          />

          <Bar
            dataKey="income"
            fill="#3b82f6"
            radius={[6, 6, 0, 0]}
          />

          <Bar
  dataKey="expense"
  fill="#ef4444"
  radius={[6, 6, 0, 0]}
/>
        </BarChart>
      )}
    </ResponsiveChartContainer>
  );
}
