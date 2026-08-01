"use client";

import {
  CalendarCheck,
  CalendarClock,
  Users,
  MapPin,
} from "lucide-react";

interface EventsStatsProps {
  totalEvents: number;
  upcomingEvents: number;
  participants: number;
  locations: number;
}

export default function EventsStats({
  totalEvents,
  upcomingEvents,
  participants,
  locations,
}: EventsStatsProps) {
  const cards = [
    {
      title: "Eventi Totali",
      value: totalEvents,
      icon: CalendarCheck,
      color: "text-indigo-300",
      bg: "bg-indigo-500/10",
    },
    {
      title: "Prossimi",
      value: upcomingEvents,
      icon: CalendarClock,
      color: "text-emerald-300",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Partecipanti",
      value: participants,
      icon: Users,
      color: "text-cyan-300",
      bg: "bg-cyan-500/10",
    },
    {
      title: "Location",
      value: locations,
      icon: MapPin,
      color: "text-amber-300",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl transition hover:border-indigo-500/40"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {card.title}
                </p>

                <h3 className="mt-3 text-3xl font-bold text-white">
                  {card.value}
                </h3>
              </div>

              <div className={`rounded-2xl p-4 ${card.bg}`}>
                <Icon className={`h-7 w-7 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}