"use client";

import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";

type EventStatus = "today" | "scheduled" | "completed";

type UpcomingEvent = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  status: EventStatus;
};

const events: UpcomingEvent[] = [
  {
    id: 1,
    title: "Assemblea Annuale",
    date: "15 Luglio 2026",
    time: "18:30",
    location: "Sala Conferenze",
    participants: 42,
    status: "scheduled",
  },
  {
    id: 2,
    title: "Corso Primo Soccorso",
    date: "02 Luglio 2026",
    time: "09:00",
    location: "Centro Formazione",
    participants: 18,
    status: "today",
  },
  {
    id: 3,
    title: "Riunione Consiglio",
    date: "20 Giugno 2026",
    time: "20:30",
    location: "Sede Associazione",
    participants: 10,
    status: "completed",
  },
];

function StatusBadge({ status }: { status: EventStatus }) {
  switch (status) {
    case "today":
      return (
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          Oggi
        </span>
      );

    case "completed":
      return (
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          Completato
        </span>
      );

    default:
      return (
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          In programma
        </span>
      );
  }
}

export default function UpcomingEvents() {
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

        {events.map((event) => (
          <div
            key={event.id}
            className="group rounded-2xl border border-gray-200 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <CalendarDays size={24} />
                </div>

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                      {event.title}
                    </h3>

                    <StatusBadge status={event.status} />

                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-gray-500 sm:grid-cols-2">

                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      {event.date}
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock3 size={16} />
                      {event.time}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      {event.location}
                    </div>

                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      {event.participants} partecipanti
                    </div>

                  </div>

                </div>

              </div>

              <ArrowRight
                size={22}
                className="text-gray-400 transition-transform duration-300 group-hover:translate-x-1"
              />

            </div>
          </div>
        ))}

      </div>

    </section>
  );
}