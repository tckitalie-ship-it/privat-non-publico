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
  value: number;
  month: number;
  dayOfMonth: number;
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

function buildHeatmapData(
  transactions: Transaction[],
): HeatmapPoint[] {
  const dailyMap = new Map<string, number>();

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

    const current = dailyMap.get(day) ?? 0;

    dailyMap.set(day, current + amount / 100);
  }

  return Array.from(dailyMap.entries())
    .sort(([first], [second]) =>
      first.localeCompare(second),
    )
    .map(([day, value]) => {
      const date = new Date(`${day}T00:00:00`);

      return {
        day,
        value,
        month: date.getMonth() + 1,
        dayOfMonth: date.getDate(),
      };
    });
}

function getPointSize(value: number) {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1000) {
    return 600;
  }

  if (absoluteValue >= 500) {
    return 450;
  }

  if (absoluteValue >= 250) {
    return 320;
  }

  if (absoluteValue >= 100) {
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

  const formattedData = data.map((point) => ({
    ...point,
    size: getPointSize(point.value),
  }));

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          Finanze
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Heatmap finanziaria
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Intensità dei movimenti finanziari registrati per giorno.
        </p>
      </div>

      {formattedData.length === 0 ? (
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
                ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                tickFormatter={(value) =>
                  `M${value}`
                }
                stroke="#94a3b8"
              />

              <YAxis
                type="number"
                dataKey="dayOfMonth"
                name="Giorno"
                domain={[1, 31]}
                ticks={[1, 5, 10, 15, 20, 25, 30, 31]}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                stroke="#94a3b8"
                width={44}
              />

              <ZAxis
                type="number"
                dataKey="size"
                range={[80, 600]}
              />

              <Tooltip
                cursor={{
                  strokeDasharray: "3 3",
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
                }}
                formatter={(value) =>
                  formatEuro(value)
                }
                content={({ active, payload }) => {
                  if (
                    !active ||
                    !payload ||
                    payload.length === 0
                  ) {
                    return null;
                  }

                  const point = payload[0]
                    ?.payload as HeatmapPoint | undefined;

                  if (!point) {
                    return null;
                  }

                  return (
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatDay(point.day)}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Movimento:{" "}
                        <span className="font-semibold text-slate-900">
                          {formatEuro(point.value)}
                        </span>
                      </p>
                    </div>
                  );
                }}
              />

              <Scatter
                name="Movimenti"
                data={formattedData}
                fill="#2563eb"
                fillOpacity={0.75}
                line={false}
              />
            </ScatterChart>
          )}
        </ResponsiveChartContainer>
      )}

      {formattedData.length > 0 && (
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