'use client';

import { useEffect, useRef, useState } from 'react';

import { Bell } from 'lucide-react';

import { API_URL, getAccessToken } from '@/lib/api';
import { getSocket } from '@/lib/socket';

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  async function loadNotifications() {
    try {
      const token = getAccessToken();

      if (!token) {
        return;
      }

      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return;
      }

      const data = await res.json();

      setNotifications(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function markAsRead(id: string) {
    try {
      const token = getAccessToken();

      if (!token) {
        return;
      }

      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      console.error(error);
    }
  }

  useEffect(() => {
    loadNotifications();

    const socket = getSocket();

    socket.on('notification:new', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off('notification:new');
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
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
        <div className="absolute right-0 z-50 mt-3 w-96 overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl">
          <div className="border-b border-white/5 p-5">
            <h2 className="text-lg font-bold text-white">
              Notifiche
            </h2>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-sm text-gray-400">
                Nessuna notifica
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`w-full border-b border-white/5 p-5 text-left transition hover:bg-white/5 ${
                    notification.read ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        {notification.message}
                      </p>
                    </div>

                    {!notification.read && (
                      <div className="mt-1 h-3 w-3 rounded-full bg-indigo-500" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}