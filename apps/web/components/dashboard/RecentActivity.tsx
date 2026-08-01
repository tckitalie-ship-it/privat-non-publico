"use client";

import { useEffect, useState } from "react";
import { API_URL, getAccessToken } from "@/lib/api";

import {
  UserPlus,
  CalendarDays,
  CreditCard,
  FileText,
  Bell,
} from "lucide-react";

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  icon: "member" | "event" | "finance" | "file" | "notification";
  createdAt: string;
};

function ActivityIcon({ icon }: { icon: ActivityItem["icon"] }) {
  switch (icon) {
    case "member":
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
          <UserPlus size={20} />
        </div>
      );
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
    case "file":
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
          <FileText size={20} />
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

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadActivity() {
      setLoading(true);
      setError(null);

      try {
        const token = getAccessToken();

        if (!token) {
          throw new Error("Sessione non valida: token assente");
        }

        const response = await fetch(
          `${API_URL}/dashboard/recent-activity`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const body = await response.text();

          throw new Error(
            `Errore API ${response.status}: ${body || response.statusText}`
          );
        }

        const data = (await response.json()) as ActivityItem[];

        setActivities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Errore attività recenti:", error);

        setActivities([]);
        setError(
          error instanceof Error
            ? error.message
            : "Impossibile caricare le attività recenti"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadActivity();
  }, []);

  return (
    <section className="rounded-3xl border border-gray-200 bg-white shadow-md">
      <div className="border-b border-gray-100 px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Attività recenti
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Ultime operazioni effettuate nella piattaforma.
        </p>
      </div>

      <div className="relative p-6">
        <div className="absolute bottom-6 left-[47px] top-6 w-px bg-gray-200" />

        <div className="space-y-6">
          {loading && (
            <p className="text-gray-500">Caricamento...</p>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && activities.length === 0 && (
            <p className="text-sm text-gray-500">
              Nessuna attività recente disponibile.
            </p>
          )}

          {!loading &&
            !error &&
            activities.map((activity) => (
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
                      {new Date(activity.createdAt).toLocaleString()}
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
    </section>
  );
}
