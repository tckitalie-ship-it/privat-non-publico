"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
} from "lucide-react";

import { API_URL, getAccessToken } from "@/lib/api";
import { getSocket } from "@/lib/socket";

type Notification = {
  id: string;
  title: string | null;
  message: string;
  read: boolean;
  createdAt: string;
  reminderId?: string | null;
};

export function NotificationBell() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [open, setOpen] = useState(false);

  const [completingReminderId, setCompletingReminderId] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadNotifications() {
      try {
        const token = getAccessToken();

        if (!token) {
          return;
        }

        const response = await fetch(
          `${API_URL}/notifications/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          console.error(
            "Errore caricamento notifiche:",
            response.status,
          );
          return;
        }

        const data =
          (await response.json()) as Notification[];

        if (mounted) {
          setNotifications(
            Array.isArray(data) ? data : [],
          );
        }
      } catch (error) {
        console.error(
          "Errore caricamento notifiche:",
          error,
        );
      }
    }

    void loadNotifications();

    const socket = getSocket();

    const handleNewNotification = (
      notification: Notification,
    ) => {
      setNotifications((prev) => {
        const alreadyExists = prev.some(
          (item) => item.id === notification.id,
        );

        if (alreadyExists) {
          return prev;
        }

        return [notification, ...prev];
      });
    };

    socket.on(
      "notification:new",
      handleNewNotification,
    );

    const handleReminderCompleted = (
      event: Event,
    ) => {
      const customEvent =
        event as CustomEvent<{
          reminderId?: string;
        }>;

      const reminderId =
        customEvent.detail?.reminderId;

      if (!reminderId) {
        return;
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.reminderId === reminderId
            ? {
                ...notification,
                read: true,
              }
            : notification,
        ),
      );
    };

    window.addEventListener(
      "reminder:completed",
      handleReminderCompleted,
    );

    return () => {
      mounted = false;

      socket.off(
        "notification:new",
        handleNewNotification,
      );

      window.removeEventListener(
        "reminder:completed",
        handleReminderCompleted,
      );
    };
  }, []);

  async function markAsRead(id: string) {
    try {
      const token = getAccessToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        console.error(
          "Errore aggiornamento notifica:",
          response.status,
        );
        return;
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification,
        ),
      );
    } catch (error) {
      console.error(
        "Errore rete aggiornamento notifica:",
        error,
      );
    }
  }
    async function completeReminder(
    notification: Notification,
  ) {
    const reminderId = notification.reminderId;

    if (!reminderId) {
      return;
    }

    try {
      setCompletingReminderId(reminderId);

      const token = getAccessToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/reminders/${reminderId}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        console.error(
          "Errore completamento reminder:",
          response.status,
        );
        return;
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                read: true,
              }
            : item,
        ),
      );

      window.dispatchEvent(
        new CustomEvent("reminder:completed", {
          detail: {
            reminderId,
          },
        }),
      );

      await markAsRead(notification.id);
    } catch (error) {
      console.error(
        "Errore rete completamento reminder:",
        error,
      );
    } finally {
      setCompletingReminderId(null);
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg p-2 transition hover:bg-slate-800"
        aria-label="Apri notifiche"
        aria-expanded={open}
      >
        <Bell className="h-6 w-6 text-white" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-red-600 px-1.5 py-0.5 text-center text-xs font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-slate-900 p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              Notifiche
            </h3>

            {unreadCount > 0 && (
              <span className="text-xs text-slate-400">
                {unreadCount} non lette
              </span>
            )}
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {notifications.length === 0 && (
              <div className="rounded-lg border border-white/10 bg-slate-800/60 p-4 text-center">
                <Bell className="mx-auto mb-2 h-5 w-5 text-slate-500" />

                <p className="text-sm text-gray-400">
                  Nessuna notifica
                </p>
              </div>
            )}

            {notifications.map((notification) => {
              const isReminder = Boolean(
                notification.reminderId,
              );

              const isCompleting =
                notification.reminderId ===
                completingReminderId;

              return (
                <div
                  key={notification.id}
                  className={`rounded-lg border p-3 transition ${
                    notification.read
                      ? "border-white/5 bg-slate-800/50"
                      : "border-blue-500/20 bg-slate-800"
                  }`}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() =>
                      !notification.read &&
                      void markAsRead(notification.id)
                    }
                  >
                    <div className="flex items-start gap-2">
                      {!notification.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {isReminder && (
                            <Clock3 className="h-4 w-4 shrink-0 text-pink-400" />
                          )}

                          <p
                            className={`font-medium ${
                              notification.read
                                ? "text-slate-300"
                                : "text-white"
                            }`}
                          >
                            {notification.title ||
                              "Notifica"}
                          </p>
                        </div>

                        <p className="mt-1 text-sm text-gray-400">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                          {new Date(
                            notification.createdAt,
                          ).toLocaleString("it-IT")}
                        </p>
                      </div>
                    </div>
                  </button>

                  {isReminder && (
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Reminder
                      </span>

                      <button
                        type="button"
                        disabled={isCompleting}
                        onClick={() =>
                          void completeReminder(
                            notification,
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isCompleting ? (
                          <Loader2
                            className="h-3.5 w-3.5 animate-spin"
                          />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}

                        {isCompleting
                          ? "Salvataggio..."
                          : "Completa"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

