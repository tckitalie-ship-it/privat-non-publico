"use client";

import { useState } from "react";

type Props = {
  onFilter: (filters: {
    type?: string;
    category?: string;
    from?: string;
    to?: string;
  }) => void;
};

const CATEGORIES = [
  "Donazione",
  "Quota associativa",
  "Evento",
  "Materiali",
  "Servizi",
  "Altro",
];

export default function FinanceFilters({ onFilter }: Props) {
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const applyFilters = () => {
    onFilter({
      type: type || undefined,
      category: category || undefined,
      from: from || undefined,
      to: to || undefined,
    });
  };

  const resetFilters = () => {
    setType("");
    setCategory("");
    setFrom("");
    setTo("");
    onFilter({});
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-lg font-semibold">Filtri Finanze</h2>

      <div className="grid gap-4 sm:grid-cols-4">
        {/* Tipo */}
        <div>
          <label className="text-sm font-medium">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-md border p-2"
          >
            <option value="">Tutti</option>
            <option value="INCOME">Entrate</option>
            <option value="EXPENSE">Uscite</option>
          </select>
        </div>

        {/* Categoria */}
        <div>
          <label className="text-sm font-medium">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-md border p-2"
          >
            <option value="">Tutte</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Data da */}
        <div>
          <label className="text-sm font-medium">Da</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 w-full rounded-md border p-2"
          />
        </div>

        {/* Data a */}
        <div>
          <label className="text-sm font-medium">A</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 w-full rounded-md border p-2"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={applyFilters}
          className="rounded-md bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
        >
          Applica filtri
        </button>

        <button
          onClick={resetFilters}
          className="rounded-md bg-gray-200 px-4 py-2 font-semibold hover:bg-gray-300"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
