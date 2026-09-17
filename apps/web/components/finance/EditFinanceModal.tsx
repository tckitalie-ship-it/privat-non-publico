"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  X,
} from "lucide-react";

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
    useState<"INCOME" | "EXPENSE">(
      "INCOME",
    );

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [amount, setAmount] =
    useState("");

  useEffect(() => {
    if (!transaction) {
      return;
    }

    const timeoutId =
      window.setTimeout(() => {
        setType(transaction.type);

        setDescription(
          transaction.description ?? "",
        );

        setCategory(
          transaction.category ?? "",
        );

        setAmount(
          (
            transaction.amountCents / 100
          ).toFixed(2),
        );
      }, 0);

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [transaction]);

  if (!open || !transaction) {
    return null;
  }

  const isIncome = type === "INCOME";

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanDescription =
      description.trim();

    const cleanCategory =
      category.trim();

    const normalizedAmount =
      amount
        .replace(",", ".")
        .trim();

    const numericAmount =
      Number(normalizedAmount);

    if (!cleanDescription) {
      return;
    }

    if (!cleanCategory) {
      return;
    }

    if (
      !Number.isFinite(
        numericAmount,
      ) ||
      numericAmount <= 0
    ) {
      return;
    }

    const amountCents =
      Math.round(
        numericAmount * 100,
      );

    if (amountCents <= 0) {
      return;
    }

    await onSave({
      type,
      description:
        cleanDescription,
      category: cleanCategory,
      amountCents,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0f172a] p-5 shadow-2xl sm:p-6"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                isIncome
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-red-500/15 text-red-300"
              }`}
            >
              {isIncome ? (
                <ArrowUpCircle
                  size={22}
                />
              ) : (
                <ArrowDownCircle
                  size={22}
                />
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                Modifica transazione
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Aggiorna i dati del
                movimento finanziario.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="edit-transaction-type"
              className="mb-2 block text-sm font-semibold text-gray-300"
            >
              Tipo
            </label>

            <select
              id="edit-transaction-type"
              value={type}
              disabled={loading}
              onChange={(event) =>
                setType(
                  event.target
                    .value as
                    | "INCOME"
                    | "EXPENSE",
                )
              }
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-white outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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
              htmlFor="edit-transaction-category"
              className="mb-2 block text-sm font-semibold text-gray-300"
            >
              Categoria
            </label>

            <select
              id="edit-transaction-category"
              value={category}
              disabled={loading}
              required
              onChange={(event) =>
                setCategory(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-white outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                Seleziona categoria
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-transaction-description"
              className="mb-2 block text-sm font-semibold text-gray-300"
            >
              Descrizione
            </label>

            <input
              id="edit-transaction-description"
              type="text"
              value={description}
              disabled={loading}
              required
              minLength={2}
              maxLength={200}
              autoComplete="off"
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Es. Donazione evento"
            />

            <p className="mt-1.5 text-xs text-gray-600">
              {description.length}/200
            </p>
          </div>

          <div>
            <label
              htmlFor="edit-transaction-amount"
              className="mb-2 block text-sm font-semibold text-gray-300"
            >
              Importo (€)
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                €
              </span>

              <input
                id="edit-transaction-amount"
                type="number"
                min="0.01"
                max="999999999"
                step="0.01"
                inputMode="decimal"
                value={amount}
                disabled={loading}
                required
                onChange={(event) =>
                  setAmount(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-[#1e293b] py-3 pl-9 pr-4 text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-3 font-medium text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Annulla
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isIncome
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-red-600 hover:bg-red-500"
              }`}
            >
              {loading && (
                <Loader2
                  className="h-4 w-4 animate-spin"
                />
              )}

              {loading
                ? "Salvataggio..."
                : "Salva modifiche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}