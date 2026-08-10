"use client";

import { useEffect, useState } from "react";
import {
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
    registrations: number;
  };
};

export default function UpcomingEvents() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      const token = getAccessToken();

      if (!token) {
        setError("Sessione non disponibile");
        setLoading(false);
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

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Errore caricamento eventi (${response.status})`,
          );
        }

        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
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
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Eventi imminenti
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          I prossimi appuntamenti della tua associazione.
        </p>
      </div>

      {loading ? (
        <div className="p-6 text-sm text-gray-500">
          Caricamento eventi...
        </div>
      ) : error ? (
        <div className="p-6 text-sm text-red-600">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="p-6 text-sm text-gray-500">
          Nessun evento imminente.
        </div>
      ) : (
        <div className="space-y-5 p-6">
          {events.map((event) => {
            const startsAt = new Date(event.startsAt);

            const date = startsAt.toLocaleDateString(
              "it-IT",
              {
                day: "2-digit",
                month: "long",
                year: "numeric",
              },
            );

            const time = startsAt.toLocaleTimeString(
              "it-IT",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            );

            return (
              <div
                key={event.id}
                className="rounded-2xl border border-gray-200 p-5"
              >
                <div className="flex gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <CalendarDays size={24} />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {event.title}
                    </h3>

                    <div className="mt-4 grid gap-2 text-sm text-gray-500 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} />
                        {date}
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock3 size={16} />
                        {time}
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        {event.location || "Luogo non indicato"}
                      </div>

                      <div className="flex items-center gap-2">
                        <Users size={16} />
                         {event._count?.registrations ?? 0}{" "}
                        {(event._count?.registrations ?? 0) === 1
                        ? "partecipante"
                         : "partecipanti"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}