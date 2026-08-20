"use client";

import ResponsiveChartContainer from "@/components/dashboard/ResponsiveChartContainer";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  date: string;
};

type DailyPoint = {
  day: string;
  income: number;
  expense: number;
  balance: number;
};

function formatDate(value: unknown) {
  const date = String(value);

  if (!date) {
    return "";
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
  }).format(parsed);
}

function formatDateLong(value: unknown) {
  const date = String(value);

  if (!date) {
    return "";
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
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

function buildDailyData(
  transactions: Transaction[],
): DailyPoint[] {
  const dailyMap = new Map<
    string,
    {
      income: number;
      expense: number;
    }
  >();

  for (const transaction of transactions) {
    const parsedDate = new Date(transaction.date);

    if (Number.isNaN(parsedDate.getTime())) {
      continue;
    }

    const amount = Number(transaction.amountCents);

    if (!Number.isFinite(amount)) {
      continue;
    }

    const day = parsedDate.toISOString().slice(0, 10);

    const current = dailyMap.get(day) ?? {
      income: 0,
      expense: 0,
    };

    if (transaction.type === "INCOME") {
      current.income += amount / 100;
    } else {
      current.expense += amount / 100;
    }

    dailyMap.set(day, current);
  }

  return Array.from(dailyMap.entries())
    .sort(([first], [second]) =>
      first.localeCompare(second),
    )
    .map(([day, values]) => ({
      day,
      income: values.income,
      expense: values.expense,
      balance: values.income - values.expense,
    }));
}

export default function FinanceDailyChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const data = buildDailyData(transactions);

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          Finanze
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Trend giornaliero
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Andamento quotidiano di entrate, uscite e bilancio.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <div>
            <p className="font-medium text-slate-700">
              Nessun dato finanziario disponibile
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Le transazioni appariranno qui quando saranno registrate.
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveChartContainer minHeight={320}>
          {({ width, height }) => (
            <LineChart
              width={width}
              height={height}
              data={data}
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
                dataKey="day"
                stroke="#94a3b8"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickFormatter={formatDate}
                minTickGap={24}
                axisLine={{
                  stroke: "#e2e8f0",
                }}
                tickLine={false}
              />

              <YAxis
                stroke="#94a3b8"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickFormatter={formatEuro}
                width={80}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                cursor={{
                  stroke: "#94a3b8",
                  strokeDasharray: "4 4",
                }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow:
                    "0 10px 25px rgba(15, 23, 42, 0.10)",
                }}
                labelStyle={{
                  color: "#0f172a",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
                itemStyle={{
                  color: "#334155",
                }}
                labelFormatter={(value) =>
                  formatDateLong(value)
                }
                formatter={(value, name) => [
                  formatEuro(value),
                  name,
                ]}
              />

              <Legend
                wrapperStyle={{
                  paddingTop: 12,
                }}
              />

              <Line
                type="monotone"
                dataKey="income"
                name="Entrate"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />

              <Line
                type="monotone"
                dataKey="expense"
                name="Uscite"
                stroke="#dc2626"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />

              <Line
                type="monotone"
                dataKey="balance"
                name="Bilancio"
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          )}
        </ResponsiveChartContainer>
      )}
    </section>
  );
}