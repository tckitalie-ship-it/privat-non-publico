"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CreditCard,
  FileText,
  UserPlus,
} from "lucide-react";

import { API_URL, getAccessToken } from "@/lib/api";

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  icon:
    | "member"
    | "event"
    | "finance"
    | "file"
    | "notification";
  createdAt: string;
};

function ActivityIcon({
  icon,
}: {
  icon: ActivityItem["icon"];
}) {
  const config = {
    member: {
      icon: UserPlus,
      className:
        "bg-blue-500/10 text-blue-400",
    },
    event: {
      icon: CalendarDays,
      className:
        "bg-green-500/10 text-green-400",
    },
    finance: {
      icon: CreditCard,
      className:
        "bg-emerald-500/10 text-emerald-400",
    },
    file: {
      icon: FileText,
      className:
        "bg-orange-500/10 text-orange-400",
    },
    notification: {
      icon: Bell,
      className:
        "bg-purple-500/10 text-purple-400",
    },
  } as const;

  const current = config[icon];
  const Icon = current.icon;

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${current.className}`}
    >
      <Icon size={20} />
    </div>
  );
}

function formatActivityDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data non disponibile";
  }

  return date.toLocaleString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<
    ActivityItem[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      const token = getAccessToken();

      if (!token) {
        if (!cancelled) {
          setActivities([]);
          setError("Sessione non disponibile");
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/dashboard/recent-activity`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        const data = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Errore caricamento attività (${response.status})`,
          );
        }

        if (!cancelled) {
          setActivities(
            Array.isArray(data)
              ? data.slice(0, 8)
              : [],
          );
        }
      } catch (error) {
        console.error(
          "Errore attività recenti:",
          error,
        );

        if (!cancelled) {
          setActivities([]);

          setError(
            error instanceof Error
              ? error.message
              : "Impossibile caricare le attività recenti",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadActivity();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] shadow-xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-8 py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Monitoraggio
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Attività recenti
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Ultime operazioni effettuate nella
            piattaforma.
          </p>
        </div>

        <Link
          href="/notifications"
          className="hidden shrink-0 items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white sm:flex"
        >
          Notifiche
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="relative p-6">
        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-2xl bg-white/10" />

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="h-4 w-1/2 rounded bg-white/10" />

                    <div className="h-3 w-full rounded bg-white/5" />

                    <div className="h-3 w-2/3 rounded bg-white/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="font-medium text-red-300">
              Impossibile caricare le attività
            </p>

            <p className="mt-2 text-sm text-red-200/70">
              {error}
            </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
            <Bell
              size={32}
              className="mx-auto text-gray-600"
            />

            <p className="mt-4 font-medium text-gray-300">
              Nessuna attività recente
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Le operazioni dell&apos;associazione
              appariranno qui.
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute bottom-6 left-[47px] top-6 w-px bg-white/10" />

            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="group relative flex items-start gap-4 rounded-2xl border border-transparent p-4 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.03]"
                >
                  <div className="relative z-10">
                    <ActivityIcon
                      icon={activity.icon}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                      <h3 className="font-semibold text-white transition-colors group-hover:text-indigo-300">
                        {activity.title}
                      </h3>

                      <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-gray-500">
                        {formatActivityDate(
                          activity.createdAt,
                        )}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-gray-400">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-6 py-4 sm:hidden">
        <Link
          href="/notifications"
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
        >
          Vai alle notifiche
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
