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
  category: string | null;
  amountCents: number;
  date: string;
};

type DonationsPoint = {
  month: string;
  donations: number;
  membership: number;
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

function buildData(
  transactions: Transaction[],
): DonationsPoint[] {
  const monthlyMap = new Map<
    string,
    {
      donations: number;
      membership: number;
    }
  >();

  for (const transaction of transactions) {
    if (transaction.type !== "INCOME") {
      continue;
    }

    const parsedDate = new Date(transaction.date);

    if (Number.isNaN(parsedDate.getTime())) {
      continue;
    }

    const amount = Number(transaction.amountCents);

    if (!Number.isFinite(amount)) {
      continue;
    }

    const month = parsedDate.toISOString().slice(0, 7);

    const current = monthlyMap.get(month) ?? {
      donations: 0,
      membership: 0,
    };

    const category = String(
      transaction.category ?? "",
    )
      .trim()
      .toLowerCase();

    const value = amount / 100;

    const isDonation =
      category.includes("donazione") ||
      category.includes("donazioni");

    const isMembership =
      category.includes("quota") ||
      category.includes("quote") ||
      category.includes("associativa") ||
      category.includes("associative");

    if (isDonation) {
      current.donations += value;
    }

    if (isMembership) {
      current.membership += value;
    }

    monthlyMap.set(month, current);
  }

  return Array.from(monthlyMap.entries())
    .sort(([first], [second]) =>
      first.localeCompare(second),
    )
    .map(([month, values]) => ({
      month,
      donations: values.donations,
      membership: values.membership,
    }));
}

export default function FinanceDonationsChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const data = buildData(transactions);

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          Finanze
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Donazioni vs quote associative
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Confronto mensile tra donazioni e quote associative.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <div>
            <p className="font-medium text-slate-700">
              Nessun dato disponibile
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Registra donazioni o quote associative per
              visualizzare l&apos;andamento.
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
                dataKey="month"
                stroke="#94a3b8"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickFormatter={formatMonth}
                tickLine={false}
                axisLine={{
                  stroke: "#e2e8f0",
                }}
                minTickGap={24}
              />

              <YAxis
                stroke="#94a3b8"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickFormatter={formatEuro}
                tickLine={false}
                axisLine={false}
                width={80}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 10px 25px rgba(15, 23, 42, 0.10)",
                }}
                labelStyle={{
                  color: "#0f172a",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
                itemStyle={{
                  color: "#334155",
                }}
                labelFormatter={(value) =>
                  `Mese: ${formatMonth(value)}`
                }
                formatter={(value, name) => [
                  formatEuro(value),
                  name,
                ]}
              />

              <Legend
                wrapperStyle={{
                  paddingTop: "16px",
                }}
              />

              <Line
                type="monotone"
                dataKey="donations"
                name="Donazioni"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />

              <Line
                type="monotone"
                dataKey="membership"
                name="Quote associative"
                stroke="#2563eb"
                strokeWidth={2.5}
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