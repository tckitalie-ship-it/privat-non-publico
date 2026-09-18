"use client";

import { useCallback, useEffect, useState } from "react";


export type NotificationItem = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = (await res.json()) as unknown[];

      setNotifications(
        data.map((n) => n as NotificationItem)
      );
    } catch {
      setMessage("Errore durante il caricamento delle notifiche");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      loadNotifications();
    });
  }, [loadNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await fetch(
        `/api/notifications/${id}/read`,
        {
          method: "PATCH",
          cache: "no-store",
        }
      );

      if (!res.ok) {
        setMessage("Errore durante l'aggiornamento");
        return;
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, read: true }
            : n
        )
      );
    } catch {
      setMessage("Errore di rete");
    }
  }, []);

  return {
    notifications,
    loading,
    message,
    markAsRead,
  };
}


