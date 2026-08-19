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

type ChartPoint = {
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
    return "€ 0,00";
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
  const formattedData: ChartPoint[] = data.map(
    (item) => ({
      month: item.month,
      income: centsToEuro(item.income),
    }),
  );

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">
          Entrate mensili
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          Andamento delle entrate registrate mese per mese.
        </p>
      </div>

      {formattedData.length === 0 ? (
        <div className="flex h-[350px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
          <p className="text-sm text-gray-400">
            Nessun dato sulle entrate disponibile.
          </p>
        </div>
      ) : (
        <div className="h-[350px] min-w-0">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
          >
            <BarChart
              data={formattedData}
              margin={{
                top: 8,
                right: 12,
                left: 8,
                bottom: 8,
              }}
              barSize={40}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.08)"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tick={{
                  fill: "#9ca3af",
                  fontSize: 12,
                }}
                axisLine={{
                  stroke: "rgba(255,255,255,0.12)",
                }}
                tickLine={false}
                tickFormatter={formatMonth}
              />

              <YAxis
                tick={{
                  fill: "#9ca3af",
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
                width={75}
                tickFormatter={formatEuro}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2433",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "12px",
                  boxShadow:
                    "0 10px 25px rgba(0,0,0,0.25)",
                }}
                labelStyle={{
                  color: "#ffffff",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
                itemStyle={{
                  color: "#60a5fa",
                }}
                cursor={{
                  fill: "rgba(255,255,255,0.04)",
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
                maxBarSize={44}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}