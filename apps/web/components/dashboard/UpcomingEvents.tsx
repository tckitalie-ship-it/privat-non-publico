"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

import { getAccessToken } from "@/lib/api";

type UpcomingEvent = {
  id: string;
  title: string;
  startsAt: string;
  location?: string | null;
  _count?: {
    registrations?: number;
  };
};

function formatEventDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      date: "Data non disponibile",
      time: "--:--",
    };
  }

  return {
    date: date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      const token = getAccessToken();

      if (!token) {
        if (!cancelled) {
          setError("Sessione non disponibile");
          setLoading(false);
        }

        return;
      }

      try {
        setError("");

        const response = await fetch(
          "/api/dashboard/latest-events",
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
              `Errore caricamento eventi (${response.status})`,
          );
        }

        if (!cancelled) {
          setEvents(
            Array.isArray(data)
              ? data.slice(0, 5)
              : [],
          );
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Impossibile caricare gli eventi",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] shadow-xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-8 py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Calendario
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Eventi imminenti
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            I prossimi appuntamenti della tua associazione.
          </p>
        </div>

        <Link
          href="/events"
          className="hidden shrink-0 items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white sm:flex"
        >
          Tutti gli eventi
          <ArrowRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4 p-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="flex gap-4">
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-white/10" />

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="h-5 w-2/3 rounded bg-white/10" />
                  <div className="h-4 w-1/2 rounded bg-white/5" />
                  <div className="h-4 w-3/4 rounded bg-white/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="font-medium text-red-300">
              Impossibile caricare gli eventi
            </p>

            <p className="mt-2 text-sm text-red-200/70">
              {error}
            </p>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="p-8">
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
            <CalendarDays
              size={32}
              className="mx-auto text-gray-600"
            />

            <p className="mt-4 font-medium text-gray-300">
              Nessun evento imminente
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Non ci sono appuntamenti programmati
              al momento.
            </p>

            <Link
              href="/events"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Vai agli eventi
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-6">
          {events.map((event) => {
            const { date, time } =
              formatEventDate(event.startsAt);

            const registrations =
              event._count?.registrations ?? 0;

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group block rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:bg-white/[0.04]"
              >
                <div className="flex gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 transition group-hover:bg-indigo-500/20">
                    <CalendarDays size={24} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="truncate text-lg font-semibold text-white transition group-hover:text-indigo-300">
                        {event.title}
                      </h3>

                      <ArrowRight
                        size={18}
                        className="mt-1 shrink-0 text-gray-600 transition-transform group-hover:translate-x-1 group-hover:text-indigo-400"
                      />
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-gray-400 sm:grid-cols-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <CalendarDays
                          size={16}
                          className="shrink-0 text-indigo-400"
                        />
                        <span className="truncate">
                          {date}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock3
                          size={16}
                          className="shrink-0 text-indigo-400"
                        />
                        <span>{time}</span>
                      </div>

                      <div className="flex min-w-0 items-center gap-2">
                        <MapPin
                          size={16}
                          className="shrink-0 text-indigo-400"
                        />
                        <span className="truncate">
                          {event.location ||
                            "Luogo non indicato"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users
                          size={16}
                          className="shrink-0 text-indigo-400"
                        />

                        <span>
                          {registrations}{" "}
                          {registrations === 1
                            ? "partecipante"
                            : "partecipanti"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="border-t border-white/10 px-6 py-4 sm:hidden">
        <Link
          href="/events"
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
        >
          Tutti gli eventi
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}