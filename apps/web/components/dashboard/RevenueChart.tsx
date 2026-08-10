"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function RevenueChart({
  data,
}: {
  data: { month: string; income: number }[];
}) {
  return (
    <div className="rounded-2xl bg-[#1a1f2e] p-6 border border-white/10 shadow-xl">
      <h2 className="text-lg font-semibold text-white mb-4">
        Entrate Mensili
      </h2>

      <div className="h-[350px] min-w-0">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          initialDimension={{ width: 500, height: 350 }}
        >
          <BarChart data={data} barSize={40}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />

            <XAxis
              dataKey="month"
              tick={{ fill: "#ccc" }}
              axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
            />

            <YAxis
              tick={{ fill: "#ccc" }}
              axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2433",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
              }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#4ea1ff" }}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />

            <Bar
              dataKey="income"
              fill="#4ea1ff"
              radius={[6, 6, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
