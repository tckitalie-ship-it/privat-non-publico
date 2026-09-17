"use client";

import { useState } from "react";
import {
  CalendarDays,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  category?: string | null;
  description?: string | null;
  amountCents: number;
  date: string;
};

type FinanceTableProps = {
  transactions: Transaction[];
  onDelete?: (id: string) => void | Promise<void>;
  onEdit?: (transaction: Transaction) => void;
};

export default function FinanceTable({
  transactions,
  onDelete,
  onEdit,
}: FinanceTableProps) {
  const [confirmId, setConfirmId] =
    useState<string | null>(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  function formatMoney(cents: number) {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  }

  function formatDate(date: string) {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString(
      "it-IT",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    );
  }

  const canManage =
    Boolean(onDelete) || Boolean(onEdit);

  const selectedTransaction =
    transactions.find(
      (transaction) =>
        transaction.id === confirmId,
    );

  async function handleDelete() {
    if (
      !confirmId ||
      !onDelete ||
      deleteLoading
    ) {
      return;
    }

    try {
      setDeleteLoading(true);
      await onDelete(confirmId);
      setConfirmId(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0f172a] p-4 shadow-xl sm:p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Transazioni
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Elenco completo delle entrate e
            delle uscite dell'associazione.
          </p>
        </div>

        <div className="text-sm text-gray-500">
          {transactions.length}{" "}
          {transactions.length === 1
            ? "movimento"
            : "movimenti"}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/5">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400">
              <th className="px-4 py-3 font-semibold">
                Data
              </th>

              <th className="px-4 py-3 font-semibold">
                Tipo
              </th>

              <th className="px-4 py-3 font-semibold">
                Categoria
              </th>

              <th className="px-4 py-3 font-semibold">
                Descrizione
              </th>

              <th className="px-4 py-3 text-right font-semibold">
                Importo
              </th>

              {canManage && (
                <th className="px-4 py-3 text-right font-semibold">
                  Azioni
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {transactions.map(
              (transaction) => {
                const isIncome =
                  transaction.type ===
                  "INCOME";

                return (
                  <tr
                    key={transaction.id}
                    className="border-b border-white/5 transition hover:bg-white/[0.035]"
                  >
                    <td className="px-4 py-4 text-gray-300">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={15}
                          className="text-gray-500"
                        />

                        {formatDate(
                          transaction.date,
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          isIncome
                            ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20"
                            : "bg-red-500/15 text-red-300 ring-1 ring-red-500/20"
                        }`}
                      >
                        {isIncome
                          ? "Entrata"
                          : "Uscita"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-gray-300">
                      {transaction.category?.trim() ||
                        "Senza categoria"}
                    </td>

                    <td className="max-w-[280px] px-4 py-4 text-gray-300">
                      <span
                        className="block truncate"
                        title={
                          transaction.description ??
                          undefined
                        }
                      >
                        {transaction.description?.trim() ||
                          "Movimento finanziario"}
                      </span>
                    </td>

                    <td
                      className={`px-4 py-4 text-right font-bold ${
                        isIncome
                          ? "text-emerald-300"
                          : "text-red-300"
                      }`}
                    >
                      {isIncome
                        ? "+"
                        : "-"}
                      {formatMoney(
                        transaction.amountCents,
                      )}
                    </td>

                    {canManage && (
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <button
                              type="button"
                              onClick={() =>
                                onEdit(
                                  transaction,
                                )
                              }
                              className="rounded-xl border border-white/10 p-2 text-indigo-300 transition hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-indigo-200"
                              aria-label="Modifica transazione"
                              title="Modifica"
                            >
                              <Pencil
                                size={17}
                              />
                            </button>
                          )}

                          {onDelete && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmId(
                                  transaction.id,
                                )
                              }
                              className="rounded-xl border border-white/10 p-2 text-red-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200"
                              aria-label="Elimina transazione"
                              title="Elimina"
                            >
                              <Trash2
                                size={17}
                              />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              },
            )}

            {transactions.length ===
              0 && (
              <tr>
                <td
                  colSpan={
                    canManage ? 6 : 5
                  }
                  className="px-4 py-12 text-center"
                >
                  <p className="font-semibold text-white">
                    Nessuna transazione
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Non ci sono movimenti
                    finanziari da visualizzare.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmId && onDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !deleteLoading
            ) {
              setConfirmId(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Elimina transazione
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Questa operazione è
                  definitiva.
                </p>
              </div>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={() =>
                  setConfirmId(null)
                }
                className="rounded-xl p-2 text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                aria-label="Chiudi"
              >
                <X size={18} />
              </button>
            </div>

            {selectedTransaction && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">
                      {selectedTransaction.description?.trim() ||
                        "Movimento finanziario"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {selectedTransaction.category?.trim() ||
                        "Senza categoria"}
                      {" · "}
                      {formatDate(
                        selectedTransaction.date,
                      )}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 font-bold ${
                      selectedTransaction.type ===
                      "INCOME"
                        ? "text-emerald-300"
                        : "text-red-300"
                    }`}
                  >
                    {selectedTransaction.type ===
                    "INCOME"
                      ? "+"
                      : "-"}
                    {formatMoney(
                      selectedTransaction.amountCents,
                    )}
                  </span>
                </div>
              </div>
            )}

            <p className="mt-5 text-sm leading-6 text-gray-400">
              Vuoi eliminare definitivamente
              questa transazione?
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() =>
                  setConfirmId(null)
                }
                className="rounded-xl border border-white/10 px-5 py-2.5 font-medium text-gray-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                Annulla
              </button>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => {
                  void handleDelete();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Eliminazione...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Elimina
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}