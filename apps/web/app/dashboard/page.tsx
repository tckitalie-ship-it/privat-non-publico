"use client";

import { getAccessToken } from "@/lib/api";

import { useEffect, useMemo, useState } from "react";
import {
  fetchFinanceTrend,
  fetchMembersTrend,
  FinanceTrendItem,
  MembersTrendItem,
} from "@/lib/api/dashboard";

import DashboardKpis from "@/components/dashboard/DashboardKpis";
import FinanceBarChart from "@/components/dashboard/FinanceBarChart";
import FinanceTrendChart from "@/components/dashboard/FinanceTrendChart";
import MembersTrendChart from "@/components/dashboard/MembersTrendChart";
import RevenueChart from "@/components/dashboard/RevenueChart";

import LatestTransactions from "@/components/dashboard/LatestTransactions";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SystemStatus from "@/components/dashboard/SystemStatus";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";

import {
  Bell,
  CalendarClock,
  ChevronRight,
  Clock3,
  ExternalLink,
  Info,
} from "lucide-react";

type DashboardNotification = {
  id?: string | number;
  title?: string;
  message?: string;
  body?: string;
  createdAt?: string;
  read?: boolean;
  isRead?: boolean;
  type?: string;
};

type DashboardReminder = {
  id?: string | number;
  title?: string;
  description?: string;
  message?: string;
  dueAt?: string;
  date?: string;
  scheduledAt?: string;
  completed?: boolean;
  status?: string;
};

function getAssociationId(): string {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("associationId") ||
    localStorage.getItem("activeAssociationId") ||
    localStorage.getItem("association_id") ||
    ""
  );
}

function extractArray<T>(payload: unknown, keys: string[]): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const object = payload as Record<string, unknown>;

  for (const key of keys) {
    if (Array.isArray(object[key])) {
      return object[key] as T[];
    }
  }

  if (
    object.data &&
    typeof object.data === "object" &&
    !Array.isArray(object.data)
  ) {
    const nested = object.data as Record<string, unknown>;

    for (const key of keys) {
      if (Array.isArray(nested[key])) {
        return nested[key] as T[];
      }
    }
  }

  return [];
}

async function fetchDashboardCollection<T>(
  basePath: string,
  associationId: string,
  collectionKeys: string[],
): Promise<T[]> {
  const token = getAccessToken();
  const encodedAssociationId = encodeURIComponent(associationId);

  const urls = [
    `${basePath}/association/${encodedAssociationId}`,
    `${basePath}/${encodedAssociationId}`,
    `${basePath}?associationId=${encodedAssociationId}`,
    basePath,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          ...(token
            ? { Authorization: "Bearer " + token }
            : {}),
          ...(associationId
            ? { "x-association-id": associationId }
            : {}),
        },
      });

      if (!response.ok) {
        continue;
      }

      const payload = await response.json();

      const result = extractArray<T>(payload, collectionKeys);

      if (result.length > 0 || Array.isArray(payload)) {
        return result;
      }
    } catch {
      // Prova silenziosamente il percorso successivo.
    }
  }

  return [];
}

function formatDate(value?: string): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatReminderDate(value?: string): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getNotificationText(notification: DashboardNotification): string {
  return (
    notification.message ||
    notification.body ||
    notification.title ||
    "Nuova notifica"
  );
}

function getReminderDate(reminder: DashboardReminder): string | undefined {
  return reminder.dueAt || reminder.date || reminder.scheduledAt;
}

function isReminderCompleted(reminder: DashboardReminder): boolean {
  if (reminder.completed === true) return true;

  const status = String(reminder.status || "").toUpperCase();

  return (
    status === "COMPLETED" ||
    status === "DONE" ||
    status === "FINISHED"
  );
}

function DashboardNotificationsPanel() {
  const [notifications, setNotifications] = useState<
    DashboardNotification[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const associationId = getAssociationId();

      try {
        const result =
          await fetchDashboardCollection<DashboardNotification>(
            "/api/notifications",
            associationId,
            ["notifications", "items", "data"],
          );

        if (!cancelled) {
          const sorted = [...result]
            .sort((a, b) => {
              const aTime = a.createdAt
                ? new Date(a.createdAt).getTime()
                : 0;
              const bTime = b.createdAt
                ? new Date(b.createdAt).getTime()
                : 0;

              return bTime - aTime;
            })
            .slice(0, 5);

          setNotifications(sorted);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          notification.read === false || notification.isRead === false,
      ).length,
    [notifications],
  );

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bell className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Notifiche</h2>

              {unreadCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Ultime comunicazioni
            </p>
          </div>
        </div>

        <a
          href="/notifications"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Vedi tutte
          <ChevronRight className="h-4 w-4" />
        </a>
      </div>

      <div className="divide-y divide-border">
        {loading ? (
          <>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse px-5 py-4"
              >
                <div className="mb-2 h-4 w-2/3 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
              </div>
            ))}
          </>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
            <Info className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">Nessuna notifica</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Non ci sono nuove comunicazioni.
            </p>
          </div>
        ) : (
          notifications.map((notification, index) => {
            const unread =
              notification.read === false ||
              notification.isRead === false;

            return (
              <div
                key={notification.id ?? `notification-${index}`}
                className={`px-5 py-4 transition-colors hover:bg-muted/40 ${
                  unread ? "bg-primary/[0.03]" : ""
                }`}
              >
                <div className="flex gap-3">
                  <div
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                      unread ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium">
                        {notification.title || "Notifica"}
                      </p>

                      {notification.createdAt && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatDate(notification.createdAt)}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {getNotificationText(notification)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
function DashboardRemindersPanel() {
  const [reminders, setReminders] = useState<DashboardReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const associationId = getAssociationId();

      try {
        const result =
          await fetchDashboardCollection<DashboardReminder>(
            "/api/reminders",
            associationId,
            ["reminders", "items", "data"],
          );

        if (!cancelled) {
          const activeReminders = result
            .filter((reminder) => !isReminderCompleted(reminder))
            .sort((a, b) => {
              const aDate = getReminderDate(a);
              const bDate = getReminderDate(b);

              const aTime = aDate
                ? new Date(aDate).getTime()
                : Number.MAX_SAFE_INTEGER;

              const bTime = bDate
                ? new Date(bDate).getTime()
                : Number.MAX_SAFE_INTEGER;

              return aTime - bTime;
            })
            .slice(0, 5);

          setReminders(activeReminders);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <CalendarClock className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold">Promemoria</h2>
            <p className="text-sm text-muted-foreground">
              Attività da ricordare
            </p>
          </div>
        </div>

        <a
          href="/dashboard/reminders"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Vedi tutti
          <ChevronRight className="h-4 w-4" />
        </a>
      </div>

      <div className="divide-y divide-border">
        {loading ? (
          <>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse px-5 py-4"
              >
                <div className="mb-2 h-4 w-3/5 rounded bg-muted" />
                <div className="h-3 w-2/5 rounded bg-muted" />
              </div>
            ))}
          </>
        ) : reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
            <Clock3 className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">Nessun promemoria</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Non hai attività in sospeso.
            </p>

            <a
              href="/dashboard/reminders"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Crea promemoria
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : (
          reminders.map((reminder, index) => {
            const reminderDate = getReminderDate(reminder);

            return (
              <div
                key={reminder.id ?? `reminder-${index}`}
                className="px-5 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Clock3 className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {reminder.title || "Promemoria"}
                    </p>

                    {(reminder.description || reminder.message) && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {reminder.description || reminder.message}
                      </p>
                    )}

                    {reminderDate && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {formatReminderDate(reminderDate)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const [financeTrend, setFinanceTrend] = useState<FinanceTrendItem[]>([]);
  const [membersTrend, setMembersTrend] = useState<MembersTrendItem[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardCharts() {
      try {
        setLoadingCharts(true);
        setChartError(null);

        const associationId = getAssociationId();

        const [finance, members] = await Promise.all([
          fetchFinanceTrend(),
          fetchMembersTrend(),
        ]);

        if (cancelled) return;

        setFinanceTrend(finance || []);
        setMembersTrend(members || []);
      } catch (error) {
        console.error("Errore caricamento dashboard:", error);

        if (!cancelled) {
          setChartError(
            "Non è stato possibile caricare i dati dei grafici.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCharts(false);
        }
      }
    }

    loadDashboardCharts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard
          </h1>

          <p className="text-sm text-muted-foreground">
            Panoramica generale dell&apos;associazione
          </p>
        </div>
      </div>

      {/* KPI */}
      <DashboardKpis />

      {/* PROMEMORIA + NOTIFICHE */}
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardRemindersPanel />
        <DashboardNotificationsPanel />
      </div>

      {/* GRAFICI PRINCIPALI */}
      {chartError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
          {chartError}
        </div>
      ) : loadingCharts ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-[360px] animate-pulse rounded-2xl bg-muted" />
          <div className="h-[360px] animate-pulse rounded-2xl bg-muted" />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <FinanceTrendChart data={financeTrend} />
          <MembersTrendChart data={membersTrend} />
        </div>
      )}

      {/* FINANZA */}
      <div className="grid gap-6 xl:grid-cols-2">
        <FinanceBarChart data={financeTrend} />
        <RevenueChart data={financeTrend} />
      </div>

      {/* AZIONI RAPIDE */}
      <QuickActions />

      {/* ATTIVITÀ + EVENTI */}
      <div className="grid gap-6 xl:grid-cols-2">
        <RecentActivity />
        <UpcomingEvents />
      </div>
      
      {/* TRANSAZIONI */}
      <LatestTransactions />

      {/* STATO SISTEMA */}
      <SystemStatus />
    </main>
  );
}



