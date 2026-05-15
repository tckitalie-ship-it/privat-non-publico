'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';

import { API_URL, getAccessToken } from '@/lib/api';
import DashboardSidebar from '@/components/dashboard-sidebar';

type DashboardKpis = {
  associations: number;
  members: number;
  events: number;
  revenue: number;
};

const chartData = [
  { month: 'Gen', revenue: 400 },
  { month: 'Feb', revenue: 900 },
  { month: 'Mar', revenue: 600 },
  { month: 'Apr', revenue: 1200 },
  { month: 'Mag', revenue: 1800 },
];

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState<DashboardKpis>({
    associations: 0,
    members: 0,
    events: 0,
    revenue: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = getAccessToken();

        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`${API_URL}/api/dashboard/kpis`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error();
        }

        const data = await res.json();

setKpis({
  associations: data.associationsCount || 0,
  members: data.membersCount || 0,
  events: data.eventsCount || 0,
  revenue: (data.incomeCents || 0) / 100,
});
      } catch {
        console.error('Errore dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f1117] p-8 text-white">
        <div className="space-y-8">
          <div className="h-12 w-72 animate-pulse rounded-2xl bg-white/10" />

          <section className="grid gap-5 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-3xl bg-white/10"
              />
            ))}
          </section>

          <div className="h-96 animate-pulse rounded-3xl bg-white/10" />
          <div className="h-40 animate-pulse rounded-3xl bg-white/10" />
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 p-8 space-y-8 lg:ml-72">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-5xl font-bold">Dashboard</h1>

            <p className="text-gray-400 mt-2">
              Panoramica associazione
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/associations/new')}
              className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
            >
              Nuova associazione
            </button>

            <button
              onClick={() => router.push('/members/invite')}
              className="rounded-xl border border-white/10 px-5 py-3 font-medium transition hover:bg-white/5"
            >
              Invita membro
            </button>

            <button
              onClick={() => router.push('/events/new')}
              className="rounded-xl border border-white/10 px-5 py-3 font-medium transition hover:bg-white/5"
            >
              Nuovo evento
            </button>
          </div>
        </div>

        <section className="grid gap-5 md:grid-cols-4 animate-fade-up">
          <button
            onClick={() => router.push('/associations')}
            className="text-left bg-[#1a1f2e] rounded-3xl border border-white/5 p-6 shadow-xl transition hover:-translate-y-1 hover:border-indigo-500/50"
          >
            <p className="text-sm text-gray-400">Associazioni</p>
            <h2 className="text-4xl font-bold mt-3">{kpis.associations}</h2>
          </button>

          <button
            onClick={() => router.push('/members')}
            className="text-left bg-[#1a1f2e] rounded-3xl border border-white/5 p-6 shadow-xl transition hover:-translate-y-1 hover:border-indigo-500/50"
          >
            <p className="text-sm text-gray-400">Membri</p>
            <h2 className="text-4xl font-bold mt-3">{kpis.members}</h2>
          </button>

          <button
            onClick={() => router.push('/events')}
            className="text-left bg-[#1a1f2e] rounded-3xl border border-white/5 p-6 shadow-xl transition hover:-translate-y-1 hover:border-indigo-500/50"
          >
            <p className="text-sm text-gray-400">Eventi</p>
            <h2 className="text-4xl font-bold mt-3">{kpis.events}</h2>
          </button>

          <button
            onClick={() => router.push('/finance')}
            className="text-left bg-[#1a1f2e] rounded-3xl border border-white/5 p-6 shadow-xl transition hover:-translate-y-1 hover:border-indigo-500/50"
          >
            <p className="text-sm text-gray-400">Entrate</p>
            <h2 className="text-4xl font-bold mt-3">
              €{kpis.revenue.toFixed(2)}
            </h2>
          </button>
        </section>

        <section className="bg-[#1a1f2e] rounded-3xl border border-white/5 p-6 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Entrate mensili</h2>

              <p className="text-gray-400 mt-1">
                Performance ultimi mesi
              </p>
            </div>

            <button
              onClick={() => router.push('/finance')}
              className="bg-indigo-600 hover:bg-indigo-500 transition px-5 py-3 rounded-xl font-medium"
            >
              Vai alle finanze
            </button>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="month" stroke="#9CA3AF" />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  labelStyle={{
                    color: '#9CA3AF',
                  }}
                />

                <Bar
                  dataKey="revenue"
                  radius={[12, 12, 0, 0]}
                  fill="#6366f1"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="animate-fade-up bg-[#1a1f2e] rounded-3xl border border-white/5 p-6 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-3xl font-bold">Azioni rapide</h2>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/members')}
                className="rounded-xl border border-white/10 px-5 py-3 transition hover:bg-white/5"
              >
                Gestisci membri
              </button>

              <button
                onClick={() => router.push('/events')}
                className="rounded-xl border border-white/10 px-5 py-3 transition hover:bg-white/5"
              >
                Eventi
              </button>

              <button
                onClick={() => router.push('/settings')}
                className="rounded-xl border border-white/10 px-5 py-3 transition hover:bg-white/5"
              >
                Impostazioni
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 p-5 bg-[#111827]">
            <p className="font-semibold text-lg">Owner</p>

            <p className="text-gray-400 mt-1">
              Associazione principale
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}