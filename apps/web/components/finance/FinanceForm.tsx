"use client";

import type { FormEvent } from "react";
import { ArrowDownCircle, ArrowUpCircle, Plus } from "lucide-react";

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
  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanDescription =
      description.trim();

    const cleanCategory =
      category.trim();

    const normalizedAmount =
      amount.replace(",", ".").trim();

    const numericAmount =
      Number(normalizedAmount);

    if (!cleanDescription) {
      return;
    }

    if (!cleanCategory) {
      return;
    }

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return;
    }

    onSubmit();
  }

  const isIncome = type === "INCOME";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-[#0f172a] p-5 shadow-xl sm:p-6"
    >
      <div className="mb-6 flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            isIncome
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-red-500/15 text-red-300"
          }`}
        >
          {isIncome ? (
            <ArrowUpCircle size={22} />
          ) : (
            <ArrowDownCircle size={22} />
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            Aggiungi transazione
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Registra una nuova entrata o uscita
            dell'associazione.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="transaction-type"
            className="text-sm font-semibold text-gray-300"
          >
            Tipo
          </label>

          <select
            id="transaction-type"
            value={type}
            onChange={(event) =>
              setType(
                event.target.value as
                  | "INCOME"
                  | "EXPENSE",
              )
            }
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-white outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="INCOME">
              Entrata
            </option>

            <option value="EXPENSE">
              Uscita
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="transaction-category"
            className="text-sm font-semibold text-gray-300"
          >
            Categoria
          </label>

          <select
            id="transaction-category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            required
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-white outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">
              Seleziona categoria
            </option>

            {CATEGORIES.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="transaction-description"
            className="text-sm font-semibold text-gray-300"
          >
            Descrizione
          </label>

          <input
            id="transaction-description"
            type="text"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            required
            minLength={2}
            maxLength={200}
            autoComplete="off"
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
            placeholder="Es. Donazione evento"
          />

          <p className="mt-1.5 text-xs text-gray-600">
            {description.length}/200
          </p>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="transaction-amount"
            className="text-sm font-semibold text-gray-300"
          >
            Importo (€)
          </label>

          <div className="relative mt-2">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
              €
            </span>

            <input
              id="transaction-amount"
              type="number"
              min="0.01"
              max="999999999"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(event) =>
                setAmount(
                  event.target.value,
                )
              }
              required
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] py-3 pl-9 pr-4 text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
              placeholder="0,00"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white shadow-lg transition ${
          isIncome
            ? "bg-emerald-600 hover:bg-emerald-500"
            : "bg-red-600 hover:bg-red-500"
        }`}
      >
        <Plus size={18} />
        Aggiungi{" "}
        {isIncome
          ? "entrata"
          : "uscita"}
      </button>
    </form>
  );
}