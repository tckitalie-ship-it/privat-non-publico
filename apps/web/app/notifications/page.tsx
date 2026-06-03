'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, RefreshCw, Trash2, Wifi, WifiOff } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import DashboardSidebar from '@/components/dashboard-sidebar';
import { API_URL } from '@/lib/api';


const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api-production-0f62.up.railway.app';

type NotificationItem = {
  id: string;
  title: string;
  message?: string | null;
  read?: boolean;
  isRead?: boolean;
  createdAt?: string;
};

function getAccessToken() {
  if (typeof window === 'undefined') return null;

  const localToken = localStorage.getItem('access_token');
  if (localToken) return localToken;

  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');

    if (key === 'access_token') {
      return decodeURIComponent(value);
    }
  }

  return null;
}

export default function NotificationsPage() {
  const socketRef = useRef<Socket | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [socketOnline, setSocketOnline] = useState(false);
  const [error, setError] = useState('');

  async function loadNotifications() {
    try {
      setLoading(true);
      setError('');

      const token = getAccessToken();

      if (!token) {
        throw new Error('Token mancante. Fai login di nuovo.');
      }

      const res = await fetch(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Errore caricamento notifiche');
      }

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      const token = getAccessToken();

      if (!token) {
        throw new Error('Token mancante. Fai login di nuovo.');
      }

      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Errore aggiornamento notifica');
      }

      await loadNotifications();
    } catch (err: any) {
      setError(String(err?.message || err));
    }
  }

  function sendTestNotification() {
    socketRef.current?.emit('notification:test', {
      title: 'Test notifica',
      message: 'Notifica realtime ricevuta correttamente.',
    });

    setNotifications((current) => [
      {
        id: `local-${Date.now()}`,
        title: 'Test notifica locale',
        message: 'Socket test inviato. Se il backend emette, apparirà realtime.',
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  }

  useEffect(() => {
    loadNotifications();

    const token = getAccessToken();

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketOnline(true);
    });

    socket.on('disconnect', () => {
      setSocketOnline(false);
    });

    socket.on('notification:new', (notification: NotificationItem) => {
      setNotifications((current) => [notification, ...current]);
    });

    socket.on('notification', (notification: NotificationItem) => {
      setNotifications((current) => [notification, ...current]);
    });

    socket.on('notifications:changed', () => {
      loadNotifications();
    });

    socket.on('events:changed', () => {
      loadNotifications();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => {
      return !notification.read && !notification.isRead;
    }).length;
  }, [notifications]);

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
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-500/20 p-3 text-cyan-300">
                    <Bell className="h-7 w-7" />
                  </div>

                  <div>
                    <h1 className="text-5xl font-bold">Notifiche</h1>
                    <p className="mt-2 text-zinc-400">
                      Centro notifiche realtime collegato al backend.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div
                  className={
                    socketOnline
                      ? 'inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300'
                      : 'inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300'
                  }
                >
                  {socketOnline ? (
                    <Wifi className="h-5 w-5" />
                  ) : (
                    <WifiOff className="h-5 w-5" />
                  )}
                  {socketOnline ? 'Socket online' : 'Socket offline'}
                </div>

                <button
                  type="button"
                  onClick={loadNotifications}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10"
                >
                  <RefreshCw className="h-5 w-5" />
                  Aggiorna
                </button>

                <button
                  type="button"
                  onClick={sendTestNotification}
                  className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-black hover:bg-cyan-400"
                >
                  Test notifica
                </button>
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
              <p className="text-sm text-zinc-400">Totale notifiche</p>
              <p className="mt-3 text-4xl font-black">{notifications.length}</p>
            </div>

            <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6">
              <p className="text-sm text-cyan-300">Da leggere</p>
              <p className="mt-3 text-4xl font-black text-cyan-300">
                {unreadCount}
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <p className="text-sm text-emerald-300">Realtime</p>
              <p className="mt-3 text-4xl font-black text-emerald-300">
                {socketOnline ? 'ON' : 'OFF'}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">
            <div className="border-b border-white/10 p-6">
              <h2 className="text-2xl font-bold">Lista notifiche</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Notifiche caricate dal backend e aggiornate realtime.
              </p>
            </div>

            {loading ? (
              <div className="p-10 text-center text-zinc-400">
                Caricamento notifiche...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center text-zinc-500">
                Nessuna notifica disponibile.
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {notifications.map((notification) => {
                  const isRead = notification.read || notification.isRead;

                  return (
                    <div
                      key={notification.id}
                      className={
                        isRead
                          ? 'flex flex-col gap-4 p-6 opacity-60 md:flex-row md:items-center md:justify-between'
                          : 'flex flex-col gap-4 bg-cyan-500/5 p-6 md:flex-row md:items-center md:justify-between'
                      }
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          {!isRead && (
                            <span className="h-3 w-3 rounded-full bg-cyan-400" />
                          )}

                          <h3 className="text-lg font-bold">
                            {notification.title}
                          </h3>
                        </div>

                        <p className="mt-2 text-sm text-zinc-400">
                          {notification.message || 'Nessun messaggio'}
                        </p>

                        <p className="mt-3 text-xs text-zinc-500">
                          {notification.createdAt
                            ? new Date(notification.createdAt).toLocaleString(
                                'it-IT',
                              )
                            : 'Data non disponibile'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {!isRead && !notification.id.startsWith('local-') && (
                          <button
                            type="button"
                            onClick={() => markAsRead(notification.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-black hover:bg-cyan-400"
                          >
                            <CheckCheck className="h-4 w-4" />
                            Letta
                          </button>
                        )}

                        {notification.id.startsWith('local-') && (
                          <button
                            type="button"
                            onClick={() =>
                              setNotifications((current) =>
                                current.filter(
                                  (item) => item.id !== notification.id,
                                ),
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            Rimuovi
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}