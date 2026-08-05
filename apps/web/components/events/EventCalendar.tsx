"use client";

import { Calendar } from "lucide-react";

export interface CalendarEvent {
  id: string;
  title: string;
  startAt: string;
}

interface EventCalendarProps {
  events: CalendarEvent[];
}

export default function EventCalendar({
  events,
}: EventCalendarProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="h-7 w-7 text-indigo-300" />

        <div>
          <h2 className="text-2xl font-bold text-white">
            Calendario Eventi
          </h2>

          <p className="text-sm text-gray-400">
            Prossimi appuntamenti programmati.
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#111827] p-10 text-center text-gray-400">
          Nessun evento programmato.
        </div>
      ) : (
        <div className="space-y-4">
          {events
            .slice()
            .sort(
              (a, b) =>
                new Date(a.startAt).getTime() -
                new Date(b.startAt).getTime()
            )
            .map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111827] p-4"
              >
                <div>
                  <h3 className="font-semibold text-white">
                    {event.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-400">
                    {new Date(event.startAt).toLocaleString("it-IT")}
                  </p>
                </div>

                <div className="rounded-xl bg-indigo-500/10 px-4 py-2 text-indigo-300">
                  Evento
                </div>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}