'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import {
  Bell,
  CalendarDays,
  DollarSign,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';

import DashboardSidebar from '@/components/dashboard-sidebar';

const API_URL = 'http://localhost:3000/api';

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
};

type NotificationItem = {
  id: string;
  title: string;
  message?: string | null;
};

type FinanceItem = {
  id: string;
  description: string;
  amount: number;
  type: string;
};

type MemberItem = {
  id: string;
  user?: {
    id: string;
    email: string;
  };
  role?: string;
};

function getAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  const token =
    localStorage.getItem('access_token');

  if (token) {
    return token;
  }

  const cookies =
    document.cookie.split(';');

  for (const cookie of cookies) {
    const [key, value] =
      cookie.trim().split('=');

    if (key === 'access_token') {
      return decodeURIComponent(
        value,
      );
    }
  }

  return null;
}

export default function SearchPage() {
  const [query, setQuery] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [events, setEvents] =
    useState<EventItem[]>([]);

  const [
    notifications,
    setNotifications,
  ] = useState<
    NotificationItem[]
  >([]);

  const [finances, setFinances] =
    useState<FinanceItem[]>(
      [],
    );

  const [members, setMembers] =
    useState<MemberItem[]>(
      [],
    );

  const [error, setError] =
    useState('');

  async function loadAll() {
    try {
      setLoading(true);
      setError('');

      const token =
        getAccessToken();

      if (!token) {
        throw new Error(
          'Token mancante',
        );
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        eventsRes,
        notificationsRes,
        financesRes,
        membersRes,
      ] = await Promise.all([
        fetch(
          `${API_URL}/events`,
          {
            headers,
          },
        ),
        fetch(
          `${API_URL}/notifications`,
          {
            headers,
          },
        ),
        fetch(
          `${API_URL}/finance`,
          {
            headers,
          },
        ),
        fetch(
          `${API_URL}/memberships`,
          {
            headers,
          },
        ),
      ]);

      const [
        eventsData,
        notificationsData,
        financesData,
        membersData,
      ] = await Promise.all([
        eventsRes
          .json()
          .catch(() => []),

        notificationsRes
          .json()
          .catch(() => []),

        financesRes
          .json()
          .catch(() => []),

        membersRes
          .json()
          .catch(() => []),
      ]);

      setEvents(
        Array.isArray(
          eventsData,
        )
          ? eventsData
          : [],
      );

      setNotifications(
        Array.isArray(
          notificationsData,
        )
          ? notificationsData
          : [],
      );

      setFinances(
        Array.isArray(
          financesData,
        )
          ? financesData
          : [],
      );

      setMembers(
        Array.isArray(
          membersData,
        )
          ? membersData
          : [],
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          'Errore caricamento',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const value =
    query.toLowerCase();

  const filteredEvents =
    useMemo(() => {
      return events.filter(
        (event) =>
          event.title
            ?.toLowerCase()
            .includes(
              value,
            ) ||
          (
            event.description ||
            ''
          )
            .toLowerCase()
            .includes(
              value,
            ) ||
          (
            event.location ||
            ''
          )
            .toLowerCase()
            .includes(
              value,
            ),
      );
    }, [events, value]);

  const filteredNotifications =
    useMemo(() => {
      return notifications.filter(
        (
          notification,
        ) =>
          notification.title
            ?.toLowerCase()
            .includes(
              value,
            ) ||
          (
            notification.message ||
            ''
          )
            .toLowerCase()
            .includes(
              value,
            ),
      );
    }, [
      notifications,
      value,
    ]);

  const filteredFinances =
    useMemo(() => {
      return finances.filter(
        (finance) =>
          finance.description
            ?.toLowerCase()
            .includes(
              value,
            ),
      );
    }, [finances, value]);

  const filteredMembers =
    useMemo(() => {
      return members.filter(
        (member) =>
          member.user?.email
            ?.toLowerCase()
            .includes(
              value,
            ) ||
          member.role
            ?.toLowerCase()
            .includes(
              value,
            ),
      );
    }, [members, value]);

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 px-6 py-8 md:ml-72">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
            >
              ← Dashboard
            </Link>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-[#111827] p-8 shadow-2xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-5xl font-bold">
                  Search globale
                </h1>

                <p className="mt-3 text-zinc-400">
                  Cerca eventi,
                  membri,
                  finanze e
                  notifiche realtime.
                </p>
              </div>

              <button
                type="button"
                onClick={loadAll}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <RefreshCw className="h-5 w-5" />
                Aggiorna
              </button>
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-3xl border border-cyan-500/20 bg-[#0b1220] px-5">
              <Search className="h-6 w-6 text-cyan-300" />

              <input
                value={query}
                onChange={(e) =>
                  setQuery(
                    e.target.value,
                  )
                }
                placeholder="Cerca ovunque..."
                className="w-full bg-transparent py-5 text-lg outline-none"
              />
            </div>
          </section>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-[#111827] p-10 text-center text-zinc-400">
              Caricamento dati...
            </div>
          ) : (
            <div className="grid gap-6">
              <section className="rounded-3xl border border-cyan-500/10 bg-[#111827] p-6 shadow-xl">
                <div className="mb-5 flex items-center gap-3">
                  <CalendarDays className="h-6 w-6 text-cyan-300" />

                  <h2 className="text-2xl font-bold">
                    Eventi
                  </h2>
                </div>

                <div className="space-y-3">
                  {filteredEvents
                    .length ===
                  0 ? (
                    <p className="text-zinc-500">
                      Nessun evento.
                    </p>
                  ) : (
                    filteredEvents.map(
                      (
                        event,
                      ) => (
                        <div
                          key={
                            event.id
                          }
                          className="rounded-2xl border border-white/10 bg-[#0b1220] p-4"
                        >
                          <p className="font-bold">
                            {
                              event.title
                            }
                          </p>

                          <p className="mt-1 text-sm text-zinc-400">
                            {event.location ||
                              '-'}
                          </p>
                        </div>
                      ),
                    )
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-emerald-500/10 bg-[#111827] p-6 shadow-xl">
                <div className="mb-5 flex items-center gap-3">
                  <DollarSign className="h-6 w-6 text-emerald-300" />

                  <h2 className="text-2xl font-bold">
                    Finanze
                  </h2>
                </div>

                <div className="space-y-3">
                  {filteredFinances
                    .length ===
                  0 ? (
                    <p className="text-zinc-500">
                      Nessun movimento.
                    </p>
                  ) : (
                    filteredFinances.map(
                      (
                        finance,
                      ) => (
                        <div
                          key={
                            finance.id
                          }
                          className="rounded-2xl border border-white/10 bg-[#0b1220] p-4"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-bold">
                              {
                                finance.description
                              }
                            </p>

                            <p className="font-bold text-emerald-300">
                              €
                              {Number(
                                finance.amount,
                              ).toFixed(
                                2,
                              )}
                            </p>
                          </div>
                        </div>
                      ),
                    )
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-violet-500/10 bg-[#111827] p-6 shadow-xl">
                <div className="mb-5 flex items-center gap-3">
                  <Bell className="h-6 w-6 text-violet-300" />

                  <h2 className="text-2xl font-bold">
                    Notifiche
                  </h2>
                </div>

                <div className="space-y-3">
                  {filteredNotifications
                    .length ===
                  0 ? (
                    <p className="text-zinc-500">
                      Nessuna notifica.
                    </p>
                  ) : (
                    filteredNotifications.map(
                      (
                        notification,
                      ) => (
                        <div
                          key={
                            notification.id
                          }
                          className="rounded-2xl border border-white/10 bg-[#0b1220] p-4"
                        >
                          <p className="font-bold">
                            {
                              notification.title
                            }
                          </p>

                          <p className="mt-1 text-sm text-zinc-400">
                            {notification.message ||
                              '-'}
                          </p>
                        </div>
                      ),
                    )
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-orange-500/10 bg-[#111827] p-6 shadow-xl">
                <div className="mb-5 flex items-center gap-3">
                  <Users className="h-6 w-6 text-orange-300" />

                  <h2 className="text-2xl font-bold">
                    Membri
                  </h2>
                </div>

                <div className="space-y-3">
                  {filteredMembers
                    .length ===
                  0 ? (
                    <p className="text-zinc-500">
                      Nessun membro.
                    </p>
                  ) : (
                    filteredMembers.map(
                      (
                        member,
                      ) => (
                        <div
                          key={
                            member.id
                          }
                          className="rounded-2xl border border-white/10 bg-[#0b1220] p-4"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-bold">
                              {member
                                .user
                                ?.email ||
                                '-'}
                            </p>

                            <p className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">
                              {member.role ||
                                '-'}
                            </p>
                          </div>
                        </div>
                      ),
                    )
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}