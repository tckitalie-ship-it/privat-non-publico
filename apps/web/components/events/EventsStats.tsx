"use client";

import {
  CalendarCheck,
  CalendarClock,
  Users,
  MapPin,
  Gauge,
  TicketCheck,
} from "lucide-react";

interface EventsStatsProps {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  participants: number;
  capacityParticipants: number;
  availablePlaces: number | null;
  locations: number;
  eventsWithCapacity: number;
  openRegistrations: number;
}

export default function EventsStats({
  totalEvents,
  upcomingEvents,
  completedEvents,
  participants,
  capacityParticipants,
  availablePlaces,
  locations,
  eventsWithCapacity,
  openRegistrations,
}: EventsStatsProps) {
  const averageParticipants =
    totalEvents > 0
      ? Math.round((participants / totalEvents) * 10) / 10
      : 0;

  const totalCapacity =
    availablePlaces !== null
      ? participants + availablePlaces
      : null;

  const occupancyRate =
    totalCapacity !== null && totalCapacity > 0
      ? Math.min(
          Math.round((capacityParticipants / totalCapacity) * 100),
          100,
        )
      : null;

  const cards = [
    {
      title: "Eventi Totali",
      value: totalEvents,
      detail: `${upcomingEvents} prossimi`,
      icon: CalendarCheck,
      color: "text-indigo-300",
      bg: "bg-indigo-500/10",
    },
    {
      title: "Prossimi",
      value: upcomingEvents,
      detail:
        upcomingEvents === 1
          ? "evento programmato"
          : "eventi programmati",
      icon: CalendarClock,
      color: "text-emerald-300",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Completati",
      value: completedEvents,
      detail:
        completedEvents === 1
          ? "evento concluso"
          : "eventi conclusi",
      icon: CalendarCheck,
      color: "text-violet-300",
      bg: "bg-violet-500/10",
    },
    {
      title: "Partecipanti",
      value: participants,
      detail: `media ${averageParticipants} per evento`,
      icon: Users,
      color: "text-cyan-300",
      bg: "bg-cyan-500/10",
    },
    {
      title: "Posti Disponibili",
      value:
        availablePlaces === null
          ? "?"
          : availablePlaces,
      detail:
        occupancyRate === null
          ? "nessuna capienza configurata"
          : `${occupancyRate}% di riempimento`,
      icon: Gauge,
      color: "text-sky-300",
      bg: "bg-sky-500/10",
    },
    {
      title: "Iscrizioni Aperte",
      value: openRegistrations,
      detail:
        openRegistrations === 1
          ? "evento disponibile"
          : "eventi disponibili",
      icon: TicketCheck,
      color: "text-green-300",
      bg: "bg-green-500/10",
    },
    {
      title: "Eventi con Capienza",
      value: eventsWithCapacity,
      detail:
        eventsWithCapacity === 1
          ? "capienza configurata"
          : "capienza configurata",
      icon: Gauge,
      color: "text-orange-300",
      bg: "bg-orange-500/10",
    },
    {
      title: "Location",
      value: locations,
      detail:
        locations === 1
          ? "location utilizzata"
          : "location utilizzate",
      icon: MapPin,
      color: "text-amber-300",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-5 shadow-xl transition hover:-translate-y-0.5 hover:border-indigo-500/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-400">
                  {card.title}
                </p>

                <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">
                  {card.value}
                </h3>

                <p className="mt-2 text-xs text-gray-500">
                  {card.detail}
                </p>
              </div>

              <div
                className={`shrink-0 rounded-2xl p-3 ${card.bg}`}
              >
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
