"use client";

import ResponsiveChartContainer from "@/components/dashboard/ResponsiveChartContainer";
import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  date: string;
};

type HeatmapPoint = {
  day: string;
  income: number;
  expense: number;
  balance: number;
  absolute: number;
  month: number;
  dayOfMonth: number;
  size: number;
};

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

function formatDay(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatMonth(value: unknown) {
  const month = Number(value);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return String(value);
  }

  return new Intl.DateTimeFormat("it-IT", {
    month: "short",
  }).format(new Date(2026, month - 1, 1));
}

function buildHeatmapData(
  transactions: Transaction[],
): HeatmapPoint[] {
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

    const day = parsedDate.toISOString().slice(0, 10);
    const amount = Number(transaction.amountCents);

    if (!Number.isFinite(amount)) {
      continue;
    }

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
    .map(([day, values]) => {
      const date = new Date(`${day}T00:00:00`);
      const balance =
        values.income - values.expense;

      return {
        day,
        income: values.income,
        expense: values.expense,
        balance,
        absolute:
          values.income + values.expense,
        month: date.getMonth() + 1,
        dayOfMonth: date.getDate(),
        size: 0,
      };
    })
    .map((point) => ({
      ...point,
      size: getPointSize(point.absolute),
    }));
}

function getPointSize(value: number) {
  if (value >= 1000) {
    return 600;
  }

  if (value >= 500) {
    return 450;
  }

  if (value >= 250) {
    return 320;
  }

  if (value >= 100) {
    return 220;
  }

  return 120;
}

export default function FinanceHeatmapChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const data = buildHeatmapData(transactions);

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          Finanze
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Heatmap finanziaria
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Intensità dei movimenti finanziari registrati
          per giorno.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <div>
            <p className="font-medium text-slate-700">
              Nessun dato finanziario disponibile
            </p>

            <p className="mt-1 text-sm text-slate-500">
              I movimenti registrati appariranno qui.
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveChartContainer minHeight={320}>
          {({ width, height }) => (
            <ScatterChart
              width={width}
              height={height}
              margin={{
                top: 12,
                right: 20,
                left: 8,
                bottom: 12,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
              />

              <XAxis
                type="number"
                dataKey="month"
                name="Mese"
                domain={[1, 12]}
                ticks={[
                  1,
                  2,
                  3,
                  4,
                  5,
                  6,
                  7,
                  8,
                  9,
                  10,
                  11,
                  12,
                ]}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickFormatter={formatMonth}
                stroke="#94a3b8"
                tickLine={false}
              />

              <YAxis
                type="number"
                dataKey="dayOfMonth"
                name="Giorno"
                domain={[1, 31]}
                ticks={[
                  1,
                  5,
                  10,
                  15,
                  20,
                  25,
                  30,
                  31,
                ]}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                stroke="#94a3b8"
                width={44}
                tickLine={false}
              />

              <ZAxis
                type="number"
                dataKey="size"
                range={[80, 600]}
              />

              <Tooltip
                cursor={{
                  stroke: "#94a3b8",
                  strokeDasharray: "4 4",
                }}
                content={({ active, payload }) => {
                  if (
                    !active ||
                    !payload ||
                    payload.length === 0
                  ) {
                    return null;
                  }

                  const point = payload[0]
                    ?.payload as
                    | HeatmapPoint
                    | undefined;

                  if (!point) {
                    return null;
                  }

                  return (
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatDay(point.day)}
                      </p>

                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-slate-600">
                          Entrate:{" "}
                          <span className="font-semibold text-slate-900">
                            {formatEuro(point.income)}
                          </span>
                        </p>

                        <p className="text-slate-600">
                          Uscite:{" "}
                          <span className="font-semibold text-slate-900">
                            {formatEuro(point.expense)}
                          </span>
                        </p>

                        <p className="text-slate-600">
                          Bilancio:{" "}
                          <span className="font-semibold text-slate-900">
                            {formatEuro(point.balance)}
                          </span>
                        </p>

                        <p className="border-t border-slate-100 pt-1 text-slate-500">
                          Movimento totale:{" "}
                          <span className="font-semibold text-slate-700">
                            {formatEuro(point.absolute)}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                }}
              />

              <Scatter
                name="Movimenti"
                data={data}
                fill="#2563eb"
                fillOpacity={0.75}
                line={false}
              />
            </ScatterChart>
          )}
        </ResponsiveChartContainer>
      )}

      {data.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="font-medium text-slate-600">
            Dimensione del punto:
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1">
            Piccolo = movimento minore
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1">
            Grande = movimento maggiore
          </span>
        </div>
      )}
    </section>
  );
}