"use client";

import NotificationCard, {
  Notification,
} from "./NotificationCard";

type Props = {
  notifications: Notification[];
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function NotificationList({
  notifications,
  onRead,
  onDelete,
}: Props) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-[#0f172a] p-10 text-center">
        <p className="text-gray-400">
          Nessuna notifica trovata.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onRead={onRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}