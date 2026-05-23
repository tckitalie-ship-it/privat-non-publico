'use client';

import { useEffect, useRef, useState } from 'react';

import {
  Bell,
  CheckCheck,
  Clock,
  Trash2,
  Plus,
} from 'lucide-react';

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const STORAGE_KEY =
  'demo-notifications';

function formatNotificationDate(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return '';
  }

  return date.toLocaleString(
    'it-IT',
    {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

export default function NotificationBell() {
  const dropdownRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [open, setOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState<Notification[]>(
      [],
    );

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read,
    ).length;

  useEffect(() => {
    const saved =
      localStorage.getItem(
        STORAGE_KEY,
      );

    if (saved) {
      try {
        setNotifications(
          JSON.parse(saved),
        );
      } catch {
        setNotifications([]);
      }
    } else {
      const demoNotifications: Notification[] =
        [
          {
            id: crypto.randomUUID(),
            title:
              'Benvenuto 👋',
            message:
              'La piattaforma è pronta.',
            read: false,
            createdAt:
              new Date().toISOString(),
          },

          {
            id: crypto.randomUUID(),
            title:
              'Evento creato',
            message:
              'I tuoi eventi vengono salvati localmente.',
            read: false,
            createdAt:
              new Date().toISOString(),
          },
        ];

      setNotifications(
        demoNotifications,
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          demoNotifications,
        ),
      );
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      );
    };
  }, []);

  function saveNotifications(
    updated: Notification[],
  ) {
    setNotifications(updated);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated),
    );
  }

  function markAsRead(id: string) {
    const updated =
      notifications.map(
        (notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification,
      );

    saveNotifications(updated);
  }

  function markAllAsRead() {
    const updated =
      notifications.map(
        (notification) => ({
          ...notification,
          read: true,
        }),
      );

    saveNotifications(updated);
  }

  function clearNotifications() {
    saveNotifications([]);
  }

  function addDemoNotification() {
    const newNotification: Notification =
      {
        id: crypto.randomUUID(),

        title:
          'Nuova attività',

        message:
          'Nuova notifica demo aggiunta.',

        read: false,

        createdAt:
          new Date().toISOString(),
      };

    saveNotifications([
      newNotification,
      ...notifications,
    ]);
  }

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() =>
          setOpen((prev) => !prev)
        }
        className="relative rounded-2xl border border-white/10 bg-[#1a1f2e] p-3 transition hover:bg-[#22283a]"
      >
        <Bell className="h-6 w-6 text-white" />

        {unreadCount > 0 && (
          <div className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {unreadCount}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[420px] overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">
          <div className="border-b border-white/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Notifiche
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {unreadCount > 0
                    ? `${unreadCount} non lette`
                    : 'Tutto aggiornato'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={
                    addDemoNotification
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/5"
                >
                  <Plus className="h-4 w-4" />
                  Demo
                </button>

                <button
                  type="button"
                  onClick={
                    markAllAsRead
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/5"
                >
                  <CheckCheck className="h-4 w-4" />
                  Lette
                </button>

                <button
                  type="button"
                  onClick={
                    clearNotifications
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto">
            {notifications.length ===
              0 && (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <Bell className="h-10 w-10 text-gray-600" />

                <p className="mt-4 font-medium text-gray-300">
                  Nessuna notifica
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Le notifiche appariranno qui.
                </p>
              </div>
            )}

            {notifications.map(
              (notification) => (
                <button
                  key={
                    notification.id
                  }
                  type="button"
                  onClick={() =>
                    markAsRead(
                      notification.id,
                    )
                  }
                  className={`w-full border-b border-white/5 p-5 text-left transition hover:bg-white/5 ${
                    notification.read
                      ? 'opacity-60'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                        )}

                        <p className="truncate font-semibold text-white">
                          {
                            notification.title
                          }
                        </p>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-gray-400">
                        {
                          notification.message
                        }
                      </p>

                      <p className="mt-3 inline-flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5" />

                        {formatNotificationDate(
                          notification.createdAt,
                        )}
                      </p>
                    </div>
                  </div>
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}