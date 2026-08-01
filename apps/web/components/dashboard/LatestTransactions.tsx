"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

import {
  API_URL,
  getAccessToken,
} from "@/lib/api";

type ApiTransaction = {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  type: string;
  amountCents: number;
  date: string;
  createdAt: string;
  updatedAt: string;
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function StatusBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
      <CheckCircle2 size={14} />
      Completata
    </span>
  );
}
export default function LatestTransactions() {
  const [transactions, setTransactions] =
    useState<ApiTransaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadTransactions() {
      setLoading(true);
      setError(null);

      try {
        const token = getAccessToken();

        if (!token) {
          throw new Error(
            "Sessione non valida: token assente",
          );
        }

        const response = await fetch(
          `${API_URL}/dashboard/latest-transactions`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        const data = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          const message = Array.isArray(
            data?.message,
          )
            ? data.message.join(", ")
            : data?.message;

          throw new Error(
            message ||
              `Errore caricamento transazioni (${response.status})`,
          );
        }

        setTransactions(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (error) {
        console.error(
          "Errore ultime transazioni:",
          error,
        );

        setTransactions([]);

        setError(
          error instanceof Error
            ? error.message
            : "Impossibile caricare le transazioni",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadTransactions();
  }, []);
    return (
    <section className="rounded-3xl border border-gray-200 bg-white shadow-md">
      <div className="border-b border-gray-100 px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Ultime transazioni
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Entrate e uscite registrate recentemente.
        </p>
      </div>

      {loading && (
        <div className="p-6 text-sm text-gray-500">
          Caricamento transazioni...
        </div>
      )}

      {!loading && error && (
        <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        transactions.length === 0 && (
          <div className="p-6 text-sm text-gray-500">
            Nessuna transazione disponibile.
          </div>
        )}

      {!loading &&
        !error &&
        transactions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Operazione
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Categoria
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Data
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                    Importo
                  </th>

                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                    Stato
                  </th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => {
                  const isIncome =
                    transaction.type === "INCOME";

                  const operation =
                    transaction.title ??
                    transaction.description ??
                    "Movimento finanziario";

                  return (
                    <tr
                      key={transaction.id}
                      className="border-t border-gray-100 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                              isIncome
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft size={20} />
                            ) : (
                              <ArrowUpRight size={20} />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {operation}
                            </p>

                            <p className="text-xs text-gray-500">
                              {transaction.description &&
                              transaction.description !== operation
                                ? transaction.description
                                : "Movimento finanziario"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-gray-600">
                        {transaction.category ??
                          (isIncome
                            ? "Entrata"
                            : "Uscita")}
                      </td>

                      <td className="px-6 py-5 text-gray-600">
                        {formatDate(transaction.date)}
                      </td>

                      <td
                        className={`px-6 py-5 text-right text-base font-bold ${
                          isIncome
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {isIncome ? "+" : "-"}{" "}
                        {formatCurrency(
                          transaction.amountCents,
                        )}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <StatusBadge />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </section>
  );
}
