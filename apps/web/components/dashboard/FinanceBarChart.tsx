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
    return String(value);
  }

  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

export default function FinanceBarChart({
  data,
}: {
  data: FinancePoint[];
}) {
  const formatted = data.map((item) => ({
    ...item,
    income: item.income / 100,
    expense: item.expense / 100,
    balance: item.balance / 100,
  }));

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Entrate e Uscite Mensili
      </h2>

      <div className="h-[350px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatted}>
            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.3}
            />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickFormatter={formatMonth}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={formatEuro}
            />

            <Tooltip
              formatter={(value) => formatEuro(value)}
              labelFormatter={(value) =>
                `Mese: ${formatMonth(value)}`
              }
            />

            <Legend />

            <Bar
              dataKey="income"
              name="Entrate"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="expense"
              name="Uscite"
              fill="#dc2626"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="balance"
              name="Bilancio"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}