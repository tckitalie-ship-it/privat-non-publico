"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

type FinancePoint = {
  month: string;
  income: number;
  expense: number;
  balance: number;
};

type ChartPoint = {
  month: string;
  income: number;
  expense: number;
  balance: number;
};

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

function tooltipFormatter(
  value: unknown,
  name: unknown,
) {
  const labels: Record<string, string> = {
    income: "Entrate",
    expense: "Uscite",
    balance: "Bilancio",
  };

  return [
    formatEuro(value),
    labels[String(name)] ?? String(name),
  ] as [string, string];
}

function tooltipLabelFormatter(value: unknown) {
  return `Mese: ${formatMonth(value)}`;
}

export default function FinanceBarChart({
  data,
}: {
  data: FinancePoint[];
}) {
  const formatted: ChartPoint[] = data.map(
    (item) => ({
      month: item.month,
      income: Number(item.income || 0) / 100,
      expense: Number(item.expense || 0) / 100,
      balance: Number(item.balance || 0) / 100,
    }),
  );

  return (
    <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Entrate e uscite mensili
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Confronto mensile tra entrate, uscite e bilancio.
        </p>
      </div>

      {formatted.length === 0 ? (
        <div className="flex h-[350px] items-center justify-center rounded-xl bg-gray-50">
          <p className="text-sm text-gray-500">
            Nessun dato finanziario disponibile.
          </p>
        </div>
      ) : (
        <div className="h-[350px] min-w-0">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={formatted}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 5,
              }}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.25}
              />

              <XAxis
                dataKey="month"
                tick={{
                  fontSize: 12,
                }}
                tickFormatter={formatMonth}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tick={{
                  fontSize: 12,
                }}
                tickFormatter={formatEuro}
                tickLine={false}
                axisLine={false}
                width={75}
              />

              <Tooltip
                formatter={tooltipFormatter}
                labelFormatter={tooltipLabelFormatter}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  boxShadow:
                    "0 10px 25px rgba(0,0,0,0.08)",
                }}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
              />

              <Bar
                dataKey="income"
                name="Entrate"
                fill="#16a34a"
                radius={[5, 5, 0, 0]}
                maxBarSize={32}
              />

              <Bar
                dataKey="expense"
                name="Uscite"
                fill="#dc2626"
                radius={[5, 5, 0, 0]}
                maxBarSize={32}
              />

              <Bar
                dataKey="balance"
                name="Bilancio"
                fill="#2563eb"
                radius={[5, 5, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}