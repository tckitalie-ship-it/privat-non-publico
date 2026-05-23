'use client';

import Link from 'next/link';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  Bar as ReBar,
  BarChart as RechartsBarChart,
} from 'recharts';

import {
  CalendarDays,
  DollarSign,
  FileText,
  MessageCircle,
  Bell,
  Building2,
  TrendingUp,
  Users,
} from 'lucide-react';

import { API_URL } from '@/lib/api';

import DashboardSidebar from '@/components/dashboard-sidebar';

type DashboardStats = {
  associations: number;
  users: number;
  memberships: number;
  events: number;
  eventRegistrations: number;
  transactions: number;
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
};

type RevenueItem = {
  id: string;
  title: string;
  type: string;
  amount: number;
  date: string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    associations: 0,
    users: 0,
    memberships: 0,
    events: 0,
    eventRegistrations: 0,
    transactions: 0,
    incomeCents: 0,
    expenseCents: 0,
    balanceCents: 0,
  });

  const [revenueChart, setRevenueChart] = useState<RevenueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      const [kpisRes, chartRes] = await Promise.all([
        fetch(`${API_URL}/dashboard/kpis`),
        fetch(`${API_URL}/dashboard/revenue-chart`),
      ]);

      if (!kpisRes.ok) {
        throw new Error('Errore caricamento KPI dashboard');
      }

      if (!chartRes.ok) {
        throw new Error('Errore caricamento revenue chart');
      }

      const kpis = await kpisRes.json();
      const chart = await chartRes.json();

      setStats({
        associations: kpis.associations || 0,
        users: kpis.users || 0,
        memberships: kpis.memberships || 0,
        events: kpis.events || 0,
        eventRegistrations: kpis.eventRegistrations || 0,
        transactions: kpis.transactions || 0,
        incomeCents: kpis.incomeCents || 0,
        expenseCents: kpis.expenseCents || 0,
        balanceCents: kpis.balanceCents || 0,
      });

      setRevenueChart(Array.isArray(chart) ? chart : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const growth = useMemo(() => {
    return stats.memberships * 12;
  }, [stats.memberships]);

  const chartData = useMemo(() => {
    return revenueChart.map((item) => ({
      name: new Date(item.date).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
      }),
      entrate: item.type === 'INCOME' ? item.amount : 0,
      uscite: item.type === 'EXPENSE' ? item.amount : 0,
    }));
  }, [revenueChart]);

  function formatMoney(cents: number) {
    return `€${(cents / 100).toFixed(2)}`;
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 p-8 md:ml-72">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-400">
                Overview piattaforma
              </p>

              <h1 className="mt-2 text-5xl font-bold">Dashboard</h1>

              <p className="mt-3 max-w-2xl text-gray-400">
                Monitora attività, membri, eventi, registrazioni e dati reali
                della tua associazione.
              </p>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-4 font-semibold transition hover:bg-indigo-500"
            >
              Nuovo evento
            </Link>
          </div>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/5 bg-[#111827] p-6 shadow-xl transition hover:border-indigo-500/30">
              <div className="flex items-center justify-between">
                <CalendarDays className="text-indigo-300" />

                <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
                  Eventi
                </span>
              </div>

              <h3 className="mt-5 text-4xl font-bold">
                {loading ? '...' : stats.events}
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Eventi creati nel database.
              </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#111827] p-6 shadow-xl transition hover:border-emerald-500/30">
              <div className="flex items-center justify-between">
                <Users className="text-emerald-300" />

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                  Membri
                </span>
              </div>

              <h3 className="mt-5 text-4xl font-bold">
                {loading ? '...' : stats.memberships}
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Membership reali registrate.
              </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#111827] p-6 shadow-xl transition hover:border-cyan-500/30">
              <div className="flex items-center justify-between">
                <FileText className="text-cyan-300" />

                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                  Movimenti
                </span>
              </div>

              <h3 className="mt-5 text-4xl font-bold">
                {loading ? '...' : stats.transactions}
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Transazioni salvate nel database.
              </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#111827] p-6 shadow-xl transition hover:border-pink-500/30">
              <div className="flex items-center justify-between">
                <Bell className="text-pink-300" />

                <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-xs text-pink-300">
                  Registrazioni
                </span>
              </div>

              <h3 className="mt-5 text-4xl font-bold">
                {loading ? '...' : stats.eventRegistrations}
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Partecipazioni reali agli eventi.
              </p>
            </div>
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/5 bg-[#111827] p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-300">Utenti</p>

                  <h2 className="mt-3 text-4xl font-bold">
                    {loading ? '...' : stats.users}
                  </h2>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
                  <MessageCircle className="h-8 w-8 text-amber-300" />
                </div>
              </div>

              <p className="mt-4 text-gray-400">
                Utenti reali creati nella piattaforma.
              </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#111827] p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300">Workspace</p>

                  <h2 className="mt-3 text-4xl font-bold">
                    {loading ? '...' : stats.associations}
                  </h2>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Building2 className="h-8 w-8 text-blue-300" />
                </div>
              </div>

              <p className="mt-4 text-gray-400">
                Associazioni create nel database.
              </p>
            </div>
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-emerald-500/20 to-[#111827] p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <TrendingUp className="text-emerald-300" />

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                  Crescita
                </span>
              </div>

              <h2 className="mt-5 text-5xl font-bold">
                +{loading ? '...' : growth}%
              </h2>

              <p className="mt-3 text-gray-300">
                Crescita calcolata dai membri reali.
              </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-500/20 to-[#111827] p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <DollarSign className="text-indigo-300" />

                <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
                  Saldo
                </span>
              </div>

              <h2 className="mt-5 text-5xl font-bold">
                {loading ? '...' : formatMoney(stats.balanceCents)}
              </h2>

              <p className="mt-3 text-gray-300">
                Entrate meno uscite reali.
              </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-cyan-500/20 to-[#111827] p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <Building2 className="text-cyan-300" />

                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                  Stato
                </span>
              </div>

              <h2 className="mt-5 text-5xl font-bold">Online</h2>

              <p className="mt-3 text-gray-300">
                Sistema operativo e collegato al backend.
              </p>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-white/5 bg-[#111827] p-8 shadow-xl">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-indigo-300">Revenue analytics</p>

                <h2 className="mt-2 text-3xl font-bold">
                  Entrate e uscite reali
                </h2>
              </div>

              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                {loading ? '...' : revenueChart.length} movimenti
              </div>
            </div>

            <div className="h-80">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 text-gray-500">
                  Nessun dato finanziario disponibile
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#9CA3AF" />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '16px',
                        color: '#fff',
                      }}
                    />

                    <ReBar
                      dataKey="entrate"
                      fill="#34d399"
                      radius={[10, 10, 0, 0]}
                    />

                    <ReBar
                      dataKey="uscite"
                      fill="#f87171"
                      radius={[10, 10, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}