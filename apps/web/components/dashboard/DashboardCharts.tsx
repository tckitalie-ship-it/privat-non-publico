"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ============================================================
   CARD GRAFICO
============================================================ */

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {children}
    </div>
  );
}

/* ============================================================
   WRAPPER CHART
============================================================ */

function ChartContainer({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const check = () => {
      if (!ref.current) return;

      const { width, height } = ref.current.getBoundingClientRect();

      if (width > 0 && height > 0) {
        setReady(true);
      }
    };

    check();

    const observer = new ResizeObserver(check);
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-[340px] w-full min-h-[300px] min-w-0">
      {ready ? children : null}
    </div>
  );
}

/* ============================================================
   REVENUE
============================================================ */

export function RevenueChart({
  data = [],
}: {
  data?: Record<string, unknown>[];
}) {
  return (
    <ChartCard
      title="Entrate mensili"
      description="Andamento delle entrate registrate."
    >
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="income"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  );
}

/* ============================================================
   FINANCE
============================================================ */

export function FinanceChart({
  data = [],
}: {
  data?: Record<string, unknown>[];
}) {
  return (
    <ChartCard
      title="Entrate vs Uscite"
      description="Confronto mensile delle operazioni."
    >
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="income" radius={[6, 6, 0, 0]} fill="#22c55e" />

            <Bar dataKey="expense" radius={[6, 6, 0, 0]} fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  );
}

/* ============================================================
   MEMBERS
============================================================ */

export function MembersTrendChart({
  data = [],
}: {
  data?: Record<string, unknown>[];
}) {
  return (
    <ChartCard
      title="Crescita membri"
      description="Nuovi membri registrati ogni mese."
    >
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="members"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  );
}
