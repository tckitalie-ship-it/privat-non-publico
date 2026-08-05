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
    count: number; // ← allineato all'API
  }[];
}

export default function MembersTrendChart({ data }: MembersTrendChartProps) {
  return (
    <ResponsiveChartContainer minHeight={300}>
      {({ width, height }) => (
        <AreaChart width={width} height={height} data={data}>
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

          <Area
            type="monotone"
            dataKey="count" // ← corretto
            stroke="#10b981"
            fill="#10b98133"
            strokeWidth={3}
          />
        </AreaChart>
      )}
    </ResponsiveChartContainer>
  );
}
