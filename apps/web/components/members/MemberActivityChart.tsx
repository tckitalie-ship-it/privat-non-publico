"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type ActivityPoint = {
  date: string;      // ISO date string, es: "2026-07-01"
  count: number;     // numero attività in quel giorno
  label?: string;    // opzionale: descrizione sintetica
};

type ActivityRange = "7d" | "30d" | "90d";

interface MemberActivityChartProps {
  memberId: string;
  data?: ActivityPoint[];
  range?: ActivityRange;
  title?: string;
}

/**
 * Mock data di esempio: puoi sostituirlo con i dati reali
 * provenienti dalla tua API /members/:id/activity-stats
 */
const MOCK_DATA_30D: ActivityPoint[] = [
  { date: "2026-06-07", count: 2 },
  { date: "2026-06-08", count: 0 },
  { date: "2026-06-09", count: 4 },
  { date: "2026-06-10", count: 1 },
  { date: "2026-06-11", count: 3 },
  { date: "2026-06-12", count: 5 },
  { date: "2026-06-13", count: 2 },
  { date: "2026-06-14", count: 6 },
  { date: "2026-06-15", count: 3 },
  { date: "2026-06-16", count: 1 },
  { date: "2026-06-17", count: 0 },
  { date: "2026-06-18", count: 4 },
  { date: "2026-06-19", count: 2 },
  { date: "2026-06-20", count: 7 },
  { date: "2026-06-21", count: 3 },
  { date: "2026-06-22", count: 5 },
  { date: "2026-06-23", count: 2 },
  { date: "2026-06-24", count: 4 },
  { date: "2026-06-25", count: 1 },
  { date: "2026-06-26", count: 0 },
  { date: "2026-06-27", count: 3 },
  { date: "2026-06-28", count: 6 },
  { date: "2026-06-29", count: 2 },
  { date: "2026-06-30", count: 4 },
  { date: "2026-07-01", count: 5 },
  { date: "2026-07-02", count: 3 },
  { date: "2026-07-03", count: 1 },
  { date: "2026-07-04", count: 0 },
  { date: "2026-07-05", count: 4 },
  { date: "2026-07-06", count: 2 },
];

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatTooltipDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: { payload: ActivityPoint }[];
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload;

  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {formatTooltipDate(label ?? point.date)}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {point.count}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          attività
        </span>
      </div>
      {point.label && (
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {point.label}
        </div>
      )}
    </div>
  );
};

export const MemberActivityChart: React.FC<MemberActivityChartProps> = ({
  memberId,
  data,
  range = "30d",
  title = "Attività del membro nel tempo",
}) => {
  const [currentRange, setCurrentRange] =
    React.useState<ActivityRange>(range);

  const chartData = React.useMemo<ActivityPoint[]>(() => {
    if (data && data.length > 0) return data;

    if (currentRange === "7d") {
      return MOCK_DATA_30D.slice(-7);
    }
    if (currentRange === "90d") {
      return MOCK_DATA_30D;
    }
    return MOCK_DATA_30D;
  }, [data, currentRange]);

  const maxCount = chartData.reduce(
    (max, p) => (p.count > max ? p.count : max),
    0
  );

  return (
    <div className="flex h-80 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Member ID: <span className="font-mono">{memberId}</span>
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 text-xs dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setCurrentRange("7d")}
            className={`rounded px-2 py-1 ${
              currentRange === "7d"
                ? "bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            7g
          </button>

          <button
            type="button"
            onClick={() => setCurrentRange("30d")}
            className={`rounded px-2 py-1 ${
              currentRange === "30d"
                ? "bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            30g
          </button>

          <button
            type="button"
            onClick={() => setCurrentRange("90d")}
            className={`rounded px-2 py-1 ${
              currentRange === "90d"
                ? "bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            90g
          </button>
        </div>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
            />

            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
              domain={[0, Math.max(maxCount + 1, 5)]}
              allowDecimals={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey="count"
              stroke="#0f766e"
              strokeWidth={2}
              dot={{
                r: 3,
                stroke: "#0f766e",
                strokeWidth: 1,
                fill: "#ecfeff",
              }}
              activeDot={{
                r: 5,
                stroke: "#0f766e",
                strokeWidth: 2,
                fill: "#ecfeff",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>
          Grafico attività nel tempo — stile insights, aggregato per giorno.
        </span>
        <span>Mock data: sostituisci con la tua API quando vuoi.</span>
      </div>
    </div>
  );
};

export default MemberActivityChart;
