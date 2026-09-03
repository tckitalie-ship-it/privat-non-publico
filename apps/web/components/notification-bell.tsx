"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import { API_URL, getAccessToken } from "@/lib/api";
import { getSocket } from "@/lib/socket";

type Notification = {
  id: string;
  title: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

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
          setNotifications(data);
        }
      } catch (error) {
        console.error(
          "Errore caricamento notifiche:",
          error,
        );
      }
    }

    loadNotifications();

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

    return () => {
      mounted = false;

      socket.off(
        "notification:new",
        handleNewNotification,
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
            ? { ...notification, read: true }
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

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg p-2 hover:bg-slate-800"
      >
        <Bell className="h-6 w-6 text-white" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 py-0.5 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-80 space-y-3 rounded-xl border border-white/10 bg-slate-900 p-4 shadow-xl">
          <h3 className="mb-2 text-sm font-semibold text-white">
            Notifiche
          </h3>

          {notifications.length === 0 && (
            <p className="text-sm text-gray-400">
              Nessuna notifica
            </p>
          )}

          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="cursor-pointer rounded-lg border border-white/10 bg-slate-800 p-3"
              onClick={() =>
                markAsRead(notification.id)
              }
            >
              <p className="font-medium text-white">
                {notification.title || "Notifica"}
              </p>

              <p className="text-sm text-gray-400">
                {notification.message}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {new Date(
                  notification.createdAt,
                ).toLocaleString("it-IT")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}