"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
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
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data non disponibile";
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function StatusBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
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
    let cancelled = false;

    async function loadTransactions() {
      const token = getAccessToken();

      if (!token) {
        if (!cancelled) {
          setTransactions([]);
          setError("Sessione non disponibile");
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError(null);

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

        if (!cancelled) {
          setTransactions(
            Array.isArray(data)
              ? data.slice(0, 8)
              : [],
          );
        }
      } catch (error) {
        console.error(
          "Errore ultime transazioni:",
          error,
        );

        if (!cancelled) {
          setTransactions([]);

          setError(
            error instanceof Error
              ? error.message
              : "Impossibile caricare le transazioni",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTransactions();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] shadow-xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-8 py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Finanze
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Ultime transazioni
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Entrate e uscite registrate
            recentemente.
          </p>
        </div>

        <Link
          href="/finance"
          className="hidden shrink-0 items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white sm:flex"
        >
          Vedi finanze
          <ArrowRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 p-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-white/10" />

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-white/10" />
                  <div className="h-3 w-1/2 rounded bg-white/5" />
                </div>

                <div className="hidden h-4 w-20 rounded bg-white/10 sm:block" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="font-medium text-red-300">
              Impossibile caricare le transazioni
            </p>

            <p className="mt-2 text-sm text-red-200/70">
              {error}
            </p>
          </div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-8 text-center">
          <CreditCard
            size={34}
            className="mx-auto text-gray-600"
          />

          <p className="mt-4 font-medium text-gray-300">
            Nessuna transazione disponibile
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Le operazioni finanziarie appariranno
            qui.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full">
              <thead className="bg-white/[0.02]">
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Operazione
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Categoria
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Data
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Importo
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Stato
                  </th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => {
                  const isIncome =
                    transaction.type === "INCOME";

                  const operation =
                    transaction.title?.trim() ||
                    transaction.description?.trim() ||
                    "Movimento finanziario";

                  const secondary =
                    transaction.description?.trim() &&
                    transaction.description.trim() !==
                      operation
                      ? transaction.description
                      : "Movimento finanziario";

                  return (
                    <tr
                      key={transaction.id}
                      className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                              isIncome
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft
                                size={20}
                              />
                            ) : (
                              <ArrowUpRight
                                size={20}
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">
                              {operation}
                            </p>

                            <p className="mt-1 truncate text-xs text-gray-500">
                              {secondary}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-400">
                        {transaction.category ||
                          (isIncome
                            ? "Entrata"
                            : "Uscita")}
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-400">
                        {formatDate(
                          transaction.date,
                        )}
                      </td>

                      <td
                        className={`px-6 py-5 text-right text-base font-bold ${
                          isIncome
                            ? "text-green-400"
                            : "text-red-400"
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

          <div className="space-y-3 p-4 md:hidden">
            {transactions.map((transaction) => {
              const isIncome =
                transaction.type === "INCOME";

              const operation =
                transaction.title?.trim() ||
                transaction.description?.trim() ||
                "Movimento finanziario";

              return (
                <div
                  key={transaction.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        isIncome
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft size={20} />
                      ) : (
                        <ArrowUpRight size={20} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-white">
                          {operation}
                        </p>

                        <p
                          className={`shrink-0 text-sm font-bold ${
                            isIncome
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {isIncome ? "+" : "-"}{" "}
                          {formatCurrency(
                            transaction.amountCents,
                          )}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>
                          {transaction.category ||
                            (isIncome
                              ? "Entrata"
                              : "Uscita")}
                        </span>

                        <span className="text-gray-700">
                          •
                        </span>

                        <span>
                          {formatDate(
                            transaction.date,
                          )}
                        </span>
                      </div>

                      <div className="mt-3">
                        <StatusBadge />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="border-t border-white/10 px-6 py-4 sm:hidden">
        <Link
          href="/finance"
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
        >
          Vai alle finanze
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}