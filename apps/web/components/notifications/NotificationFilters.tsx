"use client";

import { Search } from "lucide-react";

type FilterValue = "ALL" | "UNREAD" | "READ";

type Props = {
  search: string;
  filter: FilterValue;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: FilterValue) => void;
};

export default function NotificationFilters({
  search,
  filter,
  onSearchChange,
  onFilterChange,
}: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#0f172a] p-5 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />

        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cerca nelle notifiche..."
          className="w-full rounded-xl border border-white/10 bg-[#111827] py-3 pl-11 pr-4 text-white placeholder:text-gray-500 outline-none focus:border-blue-500"
        />
      </div>

      <select
        value={filter}
        onChange={(e) =>
          onFilterChange(e.target.value as FilterValue)
        }
        className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-blue-500"
      >
        <option value="ALL">Tutte</option>
        <option value="UNREAD">Non lette</option>
        <option value="READ">Lette</option>
      </select>
    </section>
  );
}