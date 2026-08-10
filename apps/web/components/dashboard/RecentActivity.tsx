"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CreditCard,
  Bell,
} from "lucide-react";

import { getAccessToken } from "@/lib/api";

type Activity = {
  id: string;
  title: string;
  description: string;
  icon: "event" | "finance" | "notification";
  createdAt: string;
};

function ActivityIcon({
  icon,
}: {
  icon: Activity["icon"];
}) {
  switch (icon) {
    case "event":
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600">
          <CalendarDays size={20} />
        </div>
      );

    case "finance":
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <CreditCard size={20} />
        </div>
      );

    default:
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
          <Bell size={20} />
        </div>
      );
  }
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "Adesso";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min fa`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} ${
      diffHours === 1 ? "ora" : "ore"
    } fa`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return "Ieri";
  }

  if (diffDays < 7) {
    return `${diffDays} giorni fa`;
  }

  return date.toLocaleDateString("it-IT");
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadActivities() {
      const token = getAccessToken();

      if (!token) {
        setError("Sessione non disponibile");
        setLoading(false);
        return;
      }

      try {
        setError("");

        const response = await fetch(
          "/api/dashboard/recent-activity",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Errore caricamento attività (${response.status})`,
          );
        }

        setActivities(Array.isArray(data) ? data : []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Impossibile caricare le attività recenti",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadActivities();
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Attività recenti
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Ultime operazioni effettuate nella piattaforma.
        </p>
      </div>

      {loading ? (
        <div className="p-6 text-sm text-gray-500">
          Caricamento attività...
        </div>
      ) : error ? (
        <div className="p-6 text-sm text-red-600">
          {error}
        </div>
      ) : activities.length === 0 ? (
        <div className="p-6 text-sm text-gray-500">
          Nessuna attività recente.
        </div>
      ) : (
        <div className="relative p-6">
          <div className="absolute bottom-6 left-[47px] top-6 w-px bg-gray-200" />

          <div className="space-y-6">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="group relative flex items-start gap-4 rounded-2xl p-3 transition-all duration-300 hover:bg-gray-50"
              >
                <div className="relative z-10">
                  <ActivityIcon icon={activity.icon} />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {activity.title}
                    </h3>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                      {formatRelativeTime(
                        activity.createdAt,
                      )}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}