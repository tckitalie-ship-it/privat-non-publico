"use client";

import { CalendarDays, Plus } from "lucide-react";

interface EventsHeaderProps {
  eventsCount: number;
  upcomingCount: number;
  onCreate: () => void;
}

export default function EventsHeader({
  eventsCount,
  upcomingCount,
  onCreate,
}: EventsHeaderProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-8 shadow-2xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-500/20 p-3">
            <CalendarDays className="h-7 w-7 text-indigo-300" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">
              Gestione Eventi
            </h1>

            <p className="mt-2 text-gray-400">
              Organizza, pianifica e monitora tutti gli eventi della tua associazione.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#111827] px-6 py-4">
            <div className="text-3xl font-bold text-white">
              {eventsCount}
            </div>

            <div className="mt-1 text-sm text-gray-400">
              Eventi totali
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4">
            <div className="text-3xl font-bold text-emerald-300">
              {upcomingCount}
            </div>

            <div className="mt-1 text-sm text-emerald-200">
              Prossimi eventi
            </div>
          </div>

          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 font-semibold text-white transition hover:bg-indigo-500"
          >
            <Plus className="h-5 w-5" />
            Nuovo evento
          </button>
        </div>
      </div>
    </section>
  );
}