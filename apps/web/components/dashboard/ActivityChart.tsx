"use client";

import ResponsiveChartContainer from "@/components/dashboard/ResponsiveChartContainer";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface ActivityChartProps {
  data: {
    day: string;
    activity: number;
  }[];
}

export default function ActivityChart({ data }: ActivityChartProps) {
  return (
    <ResponsiveChartContainer minHeight={260}>
      {({ width, height }) => (
        <LineChart width={width} height={height} data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="day"
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

          <Line
            type="monotone"
            dataKey="activity"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={{ r: 3, fill: "#f59e0b" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      )}
    </ResponsiveChartContainer>
  );
}
