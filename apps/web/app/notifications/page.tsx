'use client';

import {
  useEffect,
  useState,
} from 'react';

import io from 'socket.io-client';

import {
  Bell,
  CheckCircle2,
} from 'lucide-react';

import DashboardSidebar from '@/components/dashboard-sidebar';

import { API_URL } from '@/lib/api';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const socket = io(API_URL, {
  transports: ['websocket'],
});

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(
      [],
    );

  const [connected, setConnected] =
    useState(false);

  useEffect(() => {
    loadNotifications();

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on(
      'disconnect',
      () => {
        setConnected(false);
      },
    );

    socket.on(
      'notification:new',
      (notification) => {
        setNotifications(
          (prev) => [
            notification,
            ...prev,
          ],
        );
      },
    );

    return () => {
      socket.off(
        'notification:new',
      );
    };
  }, []);

  async function loadNotifications() {
    try {
      const token =
        localStorage.getItem(
          'token',
        );

      const res = await fetch(
        `${API_URL}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error(
          'Errore notifiche',
        );
      }

      const data =
        await res.json();

      setNotifications(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function markAsRead(
    id: string,
  ) {
    try {
      const token =
        localStorage.getItem(
          'token',
        );

      await fetch(
        `${API_URL}/notifications/${id}/read`,
        {
          method: 'PATCH',

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setNotifications(
        (prev) =>
          prev.map(
            (
              notification,
            ) =>
              notification.id ===
              id
                ? {
                    ...notification,
                    read: true,
                  }
                : notification,
          ),
      );
    } catch (error) {
      console.error(error);
    }
  }

  function sendTestNotification() {
    socket.emit(
      'notification:test',
      {
        title:
          'Notifica test',

        message:
          'Realtime websocket funziona correttamente 🚀',
      },
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 p-8 md:ml-72">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-400">
                Realtime center
              </p>

              <h1 className="mt-2 text-5xl font-bold">
                Notifiche
              </h1>

              <p className="mt-3 text-gray-400">
                Notifiche realtime websocket live.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  connected
                    ? 'bg-emerald-500/10 text-emerald-300'
                    : 'bg-red-500/10 text-red-300'
                }`}
              >
                {connected
                  ? 'Socket online'
                  : 'Socket offline'}
              </div>

              <button
                type="button"
                onClick={
                  sendTestNotification
                }
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold transition hover:bg-indigo-500"
              >
                Test notifica
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {notifications.length ===
              0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-[#111827] p-12 text-center text-gray-500">
                Nessuna notifica disponibile
              </div>
            )}

            {notifications.map(
              (notification) => (
                <div
                  key={
                    notification.id
                  }
                  className={`rounded-3xl border p-6 transition ${
                    notification.read
                      ? 'border-white/5 bg-[#111827]'
                      : 'border-indigo-500/20 bg-indigo-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10">
                        <Bell className="text-indigo-300" />
                      </div>

                      <div>
                        <h2 className="text-xl font-bold">
                          {
                            notification.title
                          }
                        </h2>

                        <p className="mt-2 text-gray-300">
                          {
                            notification.message
                          }
                        </p>

                        <p className="mt-3 text-sm text-gray-500">
                          {new Date(
                            notification.createdAt,
                          ).toLocaleString(
                            'it-IT',
                          )}
                        </p>
                      </div>
                    </div>

                    {!notification.read && (
                      <button
                        onClick={() =>
                          markAsRead(
                            notification.id,
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
                      >
                        <CheckCircle2 size={18} />
                        Letta
                      </button>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </main>
    </div>
  );
}