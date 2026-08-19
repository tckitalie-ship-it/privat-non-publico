"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

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

  function formatMoney(cents: number) {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  }

  const canManage =
    Boolean(onDelete) || Boolean(onEdit);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          Transazioni
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Elenco completo delle entrate e delle uscite.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-gray-400">
              <th className="py-3">
                Data
              </th>

              <th>
                Tipo
              </th>

              <th>
                Categoria
              </th>

              <th>
                Descrizione
              </th>

              <th className="text-right">
                Importo
              </th>

              {canManage && (
                <th className="text-right">
                  Azioni
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {transactions.map(
              (transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-4 text-gray-300">
                    {new Date(
                      transaction.date,
                    ).toLocaleDateString(
                      "it-IT",
                    )}
                  </td>

                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        transaction.type ===
                        "INCOME"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {transaction.type ===
                      "INCOME"
                        ? "Entrata"
                        : "Uscita"}
                    </span>
                  </td>

                  <td className="text-gray-300">
                    {transaction.category ??
                      "-"}
                  </td>

                  <td className="text-gray-300">
                    {transaction.description ??
                      "-"}
                  </td>

                  <td
                    className={`text-right font-semibold ${
                      transaction.type ===
                      "INCOME"
                        ? "text-emerald-300"
                        : "text-red-300"
                    }`}
                  >
                    {formatMoney(
                      transaction.amountCents,
                    )}
                  </td>

                  {canManage && (
                    <td>
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() =>
                              onEdit(
                                transaction,
                              )
                            }
                            className="rounded-lg p-2 text-indigo-300 hover:bg-indigo-500/10"
                            aria-label="Modifica transazione"
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
                            className="rounded-lg p-2 text-red-300 hover:bg-red-500/10"
                            aria-label="Elimina transazione"
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
              ),
            )}

            {transactions.length ===
              0 && (
              <tr>
                <td
                  colSpan={
                    canManage ? 6 : 5
                  }
                  className="py-8 text-center text-gray-500"
                >
                  Nessuna transazione
                  trovata
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmId &&
        onDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-96 rounded-2xl bg-[#111827] p-6">
              <h3 className="text-xl font-bold text-white">
                Elimina transazione
              </h3>

              <p className="mt-3 text-gray-400">
                Vuoi eliminare
                definitivamente questa
                transazione?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setConfirmId(null)
                  }
                  className="rounded-xl border border-white/10 px-5 py-2 text-gray-300"
                >
                  Annulla
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const id =
                      confirmId;

                    setConfirmId(null);

                    await onDelete(id);
                  }}
                  className="rounded-xl bg-red-600 px-5 py-2 text-white hover:bg-red-500"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        )}
    </section>
  );
}