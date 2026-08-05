"use client";

import { Bell, CheckCircle2, Trash2 } from "lucide-react";

export type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

type Props = {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function NotificationCard({
  notification,
  onRead,
  onDelete,
}: Props) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#0f172a] p-5 transition hover:border-blue-500/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <Bell
            className={
              notification.read
                ? "text-gray-500"
                : "text-blue-400"
            }
            size={22}
          />

          <div>
            <h3 className="font-semibold text-white">
              {notification.title}
            </h3>

            <p className="mt-2 text-sm text-gray-300 whitespace-pre-wrap">
              {notification.message}
            </p>

            <p className="mt-3 text-xs text-gray-500">
              {new Date(
                notification.createdAt,
              ).toLocaleString("it-IT")}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {!notification.read && (
            <button
              onClick={() => onRead(notification.id)}
              className="rounded-lg bg-emerald-600 p-2 text-white transition hover:bg-emerald-500"
              title="Segna come letta"
            >
              <CheckCircle2 size={18} />
            </button>
          )}

          <button
            onClick={() => onDelete(notification.id)}
            className="rounded-lg bg-red-600 p-2 text-white transition hover:bg-red-500"
            title="Elimina"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}