"use client";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
} from "lucide-react";
import { useMemo, useState } from "react";

export interface CalendarEvent {
  id: string;
  title: string;
  startAt: string;
  location?: string | null;
  status?: "SCHEDULED" | "CANCELLED" | "COMPLETED";
}

interface EventCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (id: string) => void;
}

const WEEKDAYS = [
  "Lun",
  "Mar",
  "Mer",
  "Gio",
  "Ven",
  "Sab",
  "Dom",
];

const MONTHS = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth()
  );
}

function getCalendarDays(month: Date) {
  const firstDay = startOfMonth(month);

  const mondayIndex = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - mondayIndex);

  const days: Date[] = [];

  for (let index = 0; index < 42; index += 1) {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    days.push(day);
  }

  return days;
}

function formatTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventCalendar({
  events,
  onEventClick,
}: EventCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(today),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    null,
  );

  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth],
  );

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    events.forEach((event) => {
      const date = new Date(event.startAt);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      const current = map.get(key) ?? [];
      current.push(event);
      map.set(key, current);
    });

    map.forEach((dayEvents) => {
      dayEvents.sort(
        (a, b) =>
          new Date(a.startAt).getTime() -
          new Date(b.startAt).getTime(),
      );
    });

    return map;
  }, [events]);

  const selectedEvents = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;

    return eventsByDay.get(key) ?? [];
  }, [eventsByDay, selectedDate]);

  const goToPreviousMonth = () => {
    setVisibleMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1,
        ),
    );
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setVisibleMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          1,
        ),
    );
    setSelectedDate(null);
  };

  const goToToday = () => {
    setVisibleMonth(startOfMonth(today));
    setSelectedDate(today);
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-7 w-7 text-indigo-300" />

          <div>
            <h2 className="text-2xl font-bold text-white">
              Calendario Eventi
            </h2>

            <p className="text-sm text-gray-400">
              Visualizza e naviga gli appuntamenti della tua
              associazione.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-gray-200 transition hover:bg-white/10"
          >
            Oggi
          </button>

          <button
            type="button"
            onClick={goToPreviousMonth}
            aria-label="Mese precedente"
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-200 transition hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Mese successivo"
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-200 transition hover:bg-white/10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold capitalize text-white">
          {MONTHS[visibleMonth.getMonth()]}{" "}
          {visibleMonth.getFullYear()}
        </h3>

        <span className="text-sm text-gray-400">
          {events.length} {events.length === 1 ? "evento" : "eventi"}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-7 border-b border-white/10 bg-[#111827]">
          {WEEKDAYS.map((weekday) => (
            <div
              key={weekday}
              className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400"
            >
              {weekday}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 bg-[#0f1420]">
          {calendarDays.map((day) => {
            const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
            const dayEvents = eventsByDay.get(key) ?? [];
            const isCurrentMonth = isSameMonth(
              day,
              visibleMonth,
            );
            const isToday = isSameDay(day, today);
            const isSelected =
              selectedDate !== null &&
              isSameDay(day, selectedDate);

            return (
              <button
                type="button"
                key={key}
                onClick={() => setSelectedDate(day)}
                className={[
                  "min-h-[105px] border-b border-r border-white/5 p-2 text-left transition",
                  "hover:bg-white/5",
                  isCurrentMonth
                    ? "text-gray-100"
                    : "text-gray-600",
                  isSelected ? "bg-indigo-500/10" : "",
                ].join(" ")}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={[
                      "flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                      isToday
                        ? "bg-indigo-500 text-white"
                        : "",
                    ].join(" ")}
                  >
                    {day.getDate()}
                  </span>

                  {dayEvents.length > 0 && (
                    <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      role="button"
                      tabIndex={0}
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        onEventClick?.(event.id);
                      }}
                      onKeyDown={(keyboardEvent) => {
                        if (
                          keyboardEvent.key === "Enter" ||
                          keyboardEvent.key === " "
                        ) {
                          keyboardEvent.preventDefault();
                          keyboardEvent.stopPropagation();
                          onEventClick?.(event.id);
                        }
                      }}
                      className={[
                        "flex min-w-0 items-center gap-1.5 rounded-lg border px-2 py-1 text-xs",
                        event.status === "CANCELLED"
                          ? "border-red-400/20 bg-red-500/10 text-red-300 line-through"
                          : event.status === "COMPLETED"
                            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                            : "border-indigo-400/10 bg-indigo-500/10 text-indigo-200",
                      ].join(" ")}
                      title={`${formatTime(event.startAt)} · ${event.title}`}
                    >
                      <span
                        className={[
                          "shrink-0 font-medium",
                          event.status === "CANCELLED"
                            ? "text-red-300/80"
                            : event.status === "COMPLETED"
                              ? "text-emerald-300/80"
                              : "text-indigo-300",
                        ].join(" ")}
                      >
                        {formatTime(event.startAt)}
                      </span>

                      <span className="min-w-0 truncate">
                        {event.title}
                      </span>
                    </div>
                  ))}

                  {dayEvents.length > 2 && (
                    <div className="px-1 text-[11px] text-gray-500">
                      +{dayEvents.length - 2} altri
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-[#111827] p-5">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">
              Giorno selezionato
            </p>

            <h4 className="mt-1 text-lg font-semibold text-white">
              {selectedDate.toLocaleDateString("it-IT", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </h4>
          </div>

          {selectedEvents.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nessun evento in questa giornata.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h5 className="font-semibold text-white">
                        {event.title}
                      </h5>

                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatTime(event.startAt)}
                        </span>

                        {event.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
                        {event.status === "CANCELLED"
                          ? "Cancellato"
                          : event.status === "COMPLETED"
                            ? "Completato"
                            : "Programmato"}
                      </span>

                      {onEventClick && (
                        <button
                          type="button"
                          onClick={() => onEventClick(event.id)}
                          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:bg-white/[0.08]"
                        >
                          Dettagli
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}


