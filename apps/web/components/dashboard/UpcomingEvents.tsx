"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";

import {
  API_URL,
  getAccessToken,
} from "@/lib/api";

type ApiEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type EventStatus =
  | "today"
  | "scheduled"
  | "completed";

function getEventStatus(
  startsAt: string,
  endsAt: string | null,
): EventStatus {
  const now = new Date();
  const start = new Date(startsAt);
  const end = endsAt
    ? new Date(endsAt)
    : start;

  if (end.getTime() < now.getTime()) {
    return "completed";
  }

  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  const eventKey = `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`;

  if (todayKey === eventKey) {
    return "today";
  }

  return "scheduled";
}

function StatusBadge({
  status,
}: {
  status: EventStatus;
}) {
  if (status === "today") {
    return (
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        Oggi
      </span>
    );
  }

  if (status === "completed") {
    return (
      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
        Completato
      </span>
    );
  }

  return (
    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
      In programma
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function UpcomingEvents() {
  const [events, setEvents] =
    useState<ApiEvent[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      setError(null);

      try {
        const token = getAccessToken();

        if (!token) {
          throw new Error(
            "Sessione non valida: token assente",
          );
        }

        const response = await fetch(
          `${API_URL}/dashboard/latest-events`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        const data = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          const message = Array.isArray(
            data?.message,
          )
            ? data.message.join(", ")
            : data?.message;

          throw new Error(
            message ||
              `Errore caricamento eventi (${response.status})`,
          );
        }

        setEvents(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (error) {
        console.error(
          "Errore eventi imminenti:",
          error,
        );

        setEvents([]);

        setError(
          error instanceof Error
            ? error.message
            : "Impossibile caricare gli eventi",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadEvents();
  }, []);

  return (
    <section className="rounded-3xl border border-gray-200 bg-white shadow-md">
      <div className="border-b border-gray-100 px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Eventi imminenti
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          I prossimi appuntamenti della tua associazione.
        </p>
      </div>

      <div className="space-y-5 p-6">
        {loading && (
          <p className="text-sm text-gray-500">
            Caricamento eventi...
          </p>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          events.length === 0 && (
            <p className="text-sm text-gray-500">
              Nessun evento disponibile.
            </p>
          )}

        {!loading &&
          !error &&
          events.map((event) => {
            const status = getEventStatus(
              event.startsAt,
              event.endsAt,
            );

            return (
              <div
                key={event.id}
                className="group rounded-2xl border border-gray-200 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                      <CalendarDays size={24} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                          {event.title}
                        </h3>

                        <StatusBadge
                          status={status}
                        />
                      </div>

                      {event.description && (
                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          {event.description}
                        </p>
                      )}

                      <div className="mt-4 grid gap-2 text-sm text-gray-500 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={16} />

                          {formatDate(
                            event.startsAt,
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock3 size={16} />

                          {formatTime(
                            event.startsAt,
                          )}
                        </div>

                        <div className="flex items-center gap-2 sm:col-span-2">
                          <MapPin size={16} />

                          {event.location?.trim() ||
                            "Luogo non specificato"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <ArrowRight
                    size={22}
                    className="shrink-0 text-gray-400 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}