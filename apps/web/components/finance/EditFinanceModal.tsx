"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

export type FinanceTransaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  description: string;
  category: string;
  amountCents: number;
};

type EditFinanceModalProps = {
  open: boolean;
  transaction: FinanceTransaction | null;
  loading?: boolean;
  onClose: () => void;
  onSave: (data: {
    type: "INCOME" | "EXPENSE";
    description: string;
    category: string;
    amountCents: number;
  }) => Promise<void>;
};

const categories = [
  "Donazione",
  "Quota associativa",
  "Evento",
  "Materiali",
  "Servizi",
  "Altro",
];

export default function EditFinanceModal({
  open,
  transaction,
  loading = false,
  onClose,
  onSave,
}: EditFinanceModalProps) {
  const [type, setType] =
    useState<"INCOME" | "EXPENSE">("INCOME");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [amount, setAmount] =
    useState("");

   useEffect(() => {
  if (!transaction) return;

  const timeoutId = window.setTimeout(() => {
    setType(transaction.type);
    setDescription(transaction.description ?? "");
    setCategory(transaction.category ?? "");
    setAmount(
      (transaction.amountCents / 100).toString(),
    );
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [transaction]);

  if (!open || !transaction) {
    return null;
  }

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    await onSave({
      type,
      description,
      category,
      amountCents: Math.round(
        Number(amount) * 100,
      ),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Modifica transazione
          </h2>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Tipo
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value as
                    | "INCOME"
                    | "EXPENSE",
                )
              }
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] p-3 text-white"
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
            <label className="mb-2 block text-sm text-gray-300">
              Categoria
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] p-3 text-white"
            >
              {categories.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Descrizione
            </label>

            <input
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value,
                )
              }
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Importo (€)
            </label>

            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] p-3 text-white"
            />
          </div>

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-3 text-gray-300"
            >
              Annulla
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              Salva modifiche
            </button>

          </div>
        </form>

      </div>
    </div>
  );
}