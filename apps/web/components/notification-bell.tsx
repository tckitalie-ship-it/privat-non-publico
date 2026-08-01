"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const STORAGE_KEY = "notifications";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  //
  // ✅ FIX REACT 19 — requestAnimationFrame
  //
  useEffect(() => {
    requestAnimationFrame(() => {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch {
          setNotifications([]);
        }
      }
    });
  }, []);

  //
  // Persistenza locale
  //
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-slate-800"
      >
        <Bell className="w-6 h-6 text-white" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-xl shadow-xl p-4 space-y-3 z-50">
          <h3 className="text-sm font-semibold text-white mb-2">
            Notifiche
          </h3>

          {notifications.length === 0 && (
            <p className="text-gray-400 text-sm">Nessuna notifica</p>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3 rounded-lg bg-slate-800 border border-white/10 cursor-pointer"
              onClick={() => markAsRead(n.id)}
            >
              <p className="font-medium text-white">{n.title}</p>
              <p className="text-gray-400 text-sm">{n.message}</p>
              <p className="text-gray-500 text-xs mt-1">
                {new Date(n.createdAt).toLocaleString("it-IT")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
