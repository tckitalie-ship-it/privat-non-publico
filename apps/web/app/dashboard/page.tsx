'use client';

import Link from 'next/link';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

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

import DashboardSidebar from '@/components/dashboard-sidebar';

export default function DashboardPage() {
  const [localStats, setLocalStats] =
    useState({
      events: 0,
      members: 0,
      files: 0,
      chats: 0,
      associations: 0,
      notifications: 0,
    });

  useEffect(() => {
    const events = JSON.parse(
      localStorage.getItem(
        'demo-events',
      ) || '[]',
    );

    const members = JSON.parse(
      localStorage.getItem(
        'demo-member-invitations',
      ) || '[]',
    );

    const files = JSON.parse(
      localStorage.getItem(
        'demo-files',
      ) || '[]',
    );

    const chats = JSON.parse(
      localStorage.getItem(
        'demo-chat-messages',
      ) || '[]',
    );

    const associations =
      JSON.parse(
        localStorage.getItem(
          'demo-associations',
        ) || '[]',
      );

    const notifications =
      JSON.parse(
        localStorage.getItem(
          'demo-notifications',
        ) || '[]',
      );

    setLocalStats({
      events: events.length,
      members: members.length,
      files: files.length,
      chats: chats.length,
      associations:
        associations.length,
      notifications:
        notifications.length,
    });
  }, []);

  const growth =
    useMemo(() => {
      return (
        localStats.members * 12
      );
    }, [localStats.members]);

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 p-8 lg:ml-72">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-400">
                Overview piattaforma
              </p>

              <h1 className="mt-2 text-5xl font-bold">
                Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-gray-400">
                Monitora attività,
                membri, eventi,
                notifiche e dati
                della tua
                associazione.
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
                {localStats.events}
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Eventi creati nella piattaforma.
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
                {localStats.members}
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Membri invitati nell’associazione.
              </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#111827] p-6 shadow-xl transition hover:border-cyan-500/30">
              <div className="flex items-center justify-between">
                <FileText className="text-cyan-300" />

                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                  Files
                </span>
              </div>

              <h3 className="mt-5 text-4xl font-bold">
                {localStats.files}
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Documenti caricati nella libreria.
              </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#111827] p-6 shadow-xl transition hover:border-pink-500/30">
              <div className="flex items-center justify-between">
                <Bell className="text-pink-300" />

                <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-xs text-pink-300">
                  Alert
                </span>
              </div>

              <h3 className="mt-5 text-4xl font-bold">
                {
                  localStats.notifications
                }
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Notifiche attive nel sistema.
              </p>
            </div>
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/5 bg-[#111827] p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-300">
                    Attività chat
                  </p>

                  <h2 className="mt-3 text-4xl font-bold">
                    {localStats.chats}
                  </h2>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
                  <MessageCircle className="h-8 w-8 text-amber-300" />
                </div>
              </div>

              <p className="mt-4 text-gray-400">
                Conversazioni salvate localmente.
              </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#111827] p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300">
                    Workspace
                  </p>

                  <h2 className="mt-3 text-4xl font-bold">
                    {
                      localStats.associations
                    }
                  </h2>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Building2 className="h-8 w-8 text-blue-300" />
                </div>
              </div>

              <p className="mt-4 text-gray-400">
                Associazioni create nella piattaforma.
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
                +{growth}%
              </h2>

              <p className="mt-3 text-gray-300">
                Crescita simulata basata sui membri.
              </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-500/20 to-[#111827] p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <DollarSign className="text-indigo-300" />

                <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
                  Revenue
                </span>
              </div>

              <h2 className="mt-5 text-5xl font-bold">
                €19K
              </h2>

              <p className="mt-3 text-gray-300">
                Entrate demo mensili della piattaforma.
              </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-cyan-500/20 to-[#111827] p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <Building2 className="text-cyan-300" />

                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                  Stato
                </span>
              </div>

              <h2 className="mt-5 text-5xl font-bold">
                Online
              </h2>

              <p className="mt-3 text-gray-300">
                Sistema operativo e stabile.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}