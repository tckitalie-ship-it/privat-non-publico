"use client";

import { Search, Filter } from "lucide-react";

interface EventFiltersProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function EventFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: EventFiltersProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Filtri Eventi
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Cerca rapidamente un evento oppure filtralo per stato.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111827] px-4">
            <Search className="h-5 w-5 text-gray-500" />

            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cerca evento..."
              className="bg-transparent py-3 text-white outline-none"
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111827] px-4">
            <Filter className="h-5 w-5 text-gray-500" />

            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-transparent py-3 text-white outline-none"
            >
              <option value="ALL" className="bg-[#111827]">
                Tutti
              </option>

              <option value="UPCOMING" className="bg-[#111827]">
                Prossimi
              </option>

              <option value="PAST" className="bg-[#111827]">
                Passati
              </option>
            </select>
          </div>

        </div>
      </div>
    </section>
  );
}