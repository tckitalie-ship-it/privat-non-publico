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

function centsToEuro(value: unknown) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return number / 100;
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

export default function RevenueChart({
  data,
}: {
  data: RevenuePoint[];
}) {
  const formattedData = data.map((item) => ({
    ...item,
    income: centsToEuro(item.income),
  }));

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Entrate Mensili
      </h2>

      <div className="h-[350px] min-w-0">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
        >
          <BarChart
            data={formattedData}
            barSize={40}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />

            <XAxis
              dataKey="month"
              tick={{ fill: "#ccc" }}
              axisLine={{
                stroke: "rgba(255,255,255,0.2)",
              }}
              tickFormatter={formatMonth}
            />

            <YAxis
              tick={{ fill: "#ccc" }}
              axisLine={{
                stroke: "rgba(255,255,255,0.2)",
              }}
              tickFormatter={formatEuro}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2433",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
              }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#4ea1ff" }}
              cursor={{
                fill: "rgba(255,255,255,0.05)",
              }}
              labelFormatter={(value) =>
                `Mese: ${formatMonth(value)}`
              }
              formatter={(value) =>
                formatEuro(value)
              }
            />

            <Bar
              dataKey="income"
              name="Entrate"
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