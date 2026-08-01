"use client";

import type { FormEvent } from "react";

type Props = {
  type: "INCOME" | "EXPENSE";
  description: string;
  category: string;
  amount: string;
  setType: (value: "INCOME" | "EXPENSE") => void;
  setDescription: (value: string) => void;
  setCategory: (value: string) => void;
  setAmount: (value: string) => void;
  onSubmit: () => void;
};

const CATEGORIES = [
  "Donazione",
  "Quota associativa",
  "Evento",
  "Materiali",
  "Servizi",
  "Altro",
];

export default function FinanceForm({
  type,
  description,
  category,
  amount,
  setType,
  setDescription,
  setCategory,
  setAmount,
  onSubmit,
}: Props) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-xl"
    >
      <h2 className="text-lg font-semibold text-white">
        Aggiungi Transazione
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="transaction-type"
            className="text-sm font-medium text-gray-300"
          >
            Tipo
          </label>

          <select
            id="transaction-type"
            value={type}
            onChange={(event) =>
              setType(event.target.value as "INCOME" | "EXPENSE")
            }
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-white bg-[#1e293b]"
          >
            <option value="INCOME">Entrata</option>
            <option value="EXPENSE">Uscita</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="transaction-category"
            className="text-sm font-medium text-gray-300"
          >
            Categoria
          </label>

          <select
            id="transaction-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-white bg-[#1e293b]"
          >
            <option value="">Seleziona categoria</option>

            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="transaction-description"
            className="text-sm font-medium text-gray-300"
          >
            Descrizione
          </label>

          <input
            id="transaction-description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-white bg-[#1e293b]"
            placeholder="Es: Donazione evento"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="transaction-amount"
            className="text-sm font-medium text-gray-300"
          >
            Importo (€)
          </label>

          <input
            id="transaction-amount"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-white bg-[#1e293b]"
            placeholder="Es: 50"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700"
      >
        Aggiungi
      </button>
    </form>
  );
}
