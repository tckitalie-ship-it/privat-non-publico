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

type WeeklyPoint = {
  week: string;
  income: number;
  expense: number;
  balance: number;
};

function getISOWeek(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const target = new Date(date.getTime());

  target.setHours(0, 0, 0, 0);
  target.setDate(
    target.getDate() + 3 - ((target.getDay() + 6) % 7),
  );

  const weekYear = target.getFullYear();

  const firstThursday = new Date(weekYear, 0, 4);

  firstThursday.setHours(0, 0, 0, 0);

  const weekNumber =
    1 +
    Math.round(
      (target.getTime() - firstThursday.getTime()) /
        604800000,
    );

  return `${weekYear}-W${String(weekNumber).padStart(2, "0")}`;
}

function formatWeek(value: unknown) {
  const week = String(value);

  const match = week.match(/^(\d{4})-W(\d{2})$/);

  if (!match) {
    return week;
  }

  return `S${match[2]}/${match[1]}`;
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

function buildWeeklyData(
  transactions: Transaction[],
): WeeklyPoint[] {
  const weeklyMap = new Map<
    string,
    {
      income: number;
      expense: number;
    }
  >();

  for (const transaction of transactions) {
    const week = getISOWeek(transaction.date);

    if (!week) {
      continue;
    }

    const amount = Number(transaction.amountCents);

    if (!Number.isFinite(amount)) {
      continue;
    }

    const current = weeklyMap.get(week) ?? {
      income: 0,
      expense: 0,
    };

    if (transaction.type === "INCOME") {
      current.income += amount / 100;
    } else {
      current.expense += amount / 100;
    }

    weeklyMap.set(week, current);
  }

  return Array.from(weeklyMap.entries())
    .sort(([first], [second]) =>
      first.localeCompare(second),
    )
    .map(([week, values]) => ({
      week,
      income: values.income,
      expense: values.expense,
      balance: values.income - values.expense,
    }));
}

export default function FinanceWeeklyChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const data = buildWeeklyData(transactions);

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          Finanze
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Trend settimanale
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Confronto settimanale tra entrate, uscite e bilancio.
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
              />

              <XAxis
                dataKey="week"
                stroke="#94a3b8"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickFormatter={formatWeek}
                minTickGap={24}
              />

              <YAxis
                stroke="#94a3b8"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickFormatter={formatEuro}
                width={76}
              />

              <Tooltip
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
                labelFormatter={(value) =>
                  `Settimana ${formatWeek(value)}`
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