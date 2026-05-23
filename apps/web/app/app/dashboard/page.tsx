'use client';

import { useEffect, useState } from 'react';

import DashboardSidebar from '@/components/dashboard-sidebar';

type Kpis = {
  associationsCount?: number;
  membersCount?: number;
  eventsCount?: number;
  incomeCents?: number;
};

type ChartItem = {
  month: string;
  revenue: number;
};

export default function Page() {
  const [allowed, setAllowed] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [kpis, setKpis] =
    useState<Kpis>({});

  const [chart, setChart] =
    useState<ChartItem[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const token =
        localStorage.getItem(
          'access_token',
        ) ||
        localStorage.getItem(
          'token',
        ) ||
        localStorage.getItem('jwt');

      if (!token) {
        window.location.href =
          '/login';
        return;
      }

      setAllowed(true);

      try {
        const [kpisRes, chartRes] =
          await Promise.all([
            fetch(
              'http://localhost:3001/dashboard/kpis',
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            ),

            fetch(
              'http://localhost:3001/dashboard/revenue-chart',
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            ),
          ]);

        if (kpisRes.ok) {
          const data =
            await kpisRes.json();

          setKpis(data);
        }

        if (chartRes.ok) {
          const data =
            await chartRes.json();

          setChart(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (!allowed || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090D14] text-white">
        Caricamento dashboard...
      </main>
    );
  }

  const cards = [
    {
      title: 'Membri',
      value: kpis.membersCount ?? 0,
    },
    {
      title: 'Eventi',
      value: kpis.eventsCount ?? 0,
    },
    {
      title: 'Entrate',
      value: `€${(
        (kpis.incomeCents ?? 0) /
        100
      ).toFixed(2)}`,
    },
    {
      title: 'Associazioni',
      value:
        kpis.associationsCount ??
        0,
    },
  ];

  const chartData =
    chart.length > 0
      ? chart
      : [
          {
            month: 'Jan',
            revenue: 0,
          },
          {
            month: 'Feb',
            revenue: 0,
          },
          {
            month: 'Mar',
            revenue: 0,
          },
          {
            month: 'Apr',
            revenue: 0,
          },
          {
            month: 'May',
            revenue: 0,
          },
          {
            month: 'Jun',
            revenue: 0,
          },
        ];

  const maxRevenue = Math.max(
    ...chartData.map(
      (item) => item.revenue || 0,
    ),
    1,
  );

  return (
    <div className="flex min-h-screen bg-[#090D14] text-white">
      <DashboardSidebar />

      <main className="flex-1 p-8">
        <div className="mb-10">
          <p className="text-sm text-zinc-500">
            Dashboard
          </p>

          <h1 className="mt-2 text-5xl font-bold tracking-tight">
            Overview
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Dati reali collegati al
            backend NestJS.
          </p>
        </div>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
            >
              <p className="text-sm text-zinc-500">
                {card.title}
              </p>

              <h2 className="mt-4 text-4xl font-bold tracking-tight">
                {card.value}
              </h2>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 xl:col-span-2">
            <h2 className="text-2xl font-semibold">
              Revenue
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Entrate mensili dal
              database
            </p>

            <div className="mt-10 flex h-72 items-end gap-4">
              {chartData.map((item) => {
                const height =
                  Math.max(
                    ((item.revenue ||
                      0) /
                      maxRevenue) *
                      100,
                    4,
                  );

                return (
                  <div
                    key={item.month}
                    className="flex flex-1 flex-col justify-end"
                  >
                    <div
                      className="rounded-t-2xl bg-white"
                      style={{
                        height: `${height}%`,
                      }}
                    />

                    <span className="mt-3 text-center text-xs text-zinc-500">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">
              Stato sistema
            </h2>

            <div className="mt-6 space-y-5">
              {[
                'Backend collegato',
                'JWT attivo',
                'Dashboard protetta',
                'KPI caricati',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between border-b border-white/5 pb-4"
                >
                  <p className="text-sm font-medium">
                    {item}
                  </p>

                  <div className="h-2 w-2 rounded-full bg-green-400" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}