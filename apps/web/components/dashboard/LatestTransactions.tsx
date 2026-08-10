"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

import { getAccessToken } from "@/lib/api";

type Transaction = {
  id: string;
  type: string;
  category?: string | null;
  description?: string | null;
  title?: string | null;
  amountCents: number;
  date: string;
};

export default function LatestTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransactions() {
      const token = getAccessToken();

      if (!token) {
        setError("Sessione non disponibile");
        setLoading(false);
        return;
      }

      try {
        setError("");

        const response = await fetch(
          "/api/dashboard/latest-transactions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Errore caricamento transazioni (${response.status})`,
          );
        }

        setTransactions(Array.isArray(data) ? data : []);
      } catch (error) {
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
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Ultime transazioni
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Entrate e uscite registrate recentemente.
        </p>
      </div>

      {loading ? (
        <div className="px-8 py-8 text-sm text-gray-500">
          Caricamento transazioni...
        </div>
      ) : error ? (
        <div className="px-8 py-8 text-sm text-red-600">
          {error}
        </div>
      ) : transactions.length === 0 ? (
        <div className="px-8 py-8 text-sm text-gray-500">
          Nessuna transazione registrata.
        </div>
      ) : (
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
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => {
                const isIncome =
                  transaction.type === "INCOME";

                const amount =
                  transaction.amountCents / 100;

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
                            {transaction.description ||
                              transaction.title ||
                              "Movimento finanziario"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {isIncome ? "Entrata" : "Uscita"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-gray-600">
                      {transaction.category || "Altro"}
                    </td>

                    <td className="px-6 py-5 text-gray-600">
                      {new Date(
                        transaction.date,
                      ).toLocaleDateString("it-IT")}
                    </td>

                    <td
                      className={`px-6 py-5 text-right text-base font-bold ${
                        isIncome
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {isIncome ? "+" : "-"}{" "}
                      {amount.toLocaleString("it-IT", {
                        style: "currency",
                        currency: "EUR",
                      })}
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