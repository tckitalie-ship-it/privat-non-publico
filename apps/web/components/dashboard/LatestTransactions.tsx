"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
} from "lucide-react";

type TransactionStatus = "completed" | "pending";

type TransactionType = "income" | "expense";

type Transaction = {
  id: number;
  description: string;
  category: string;
  date: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
};

const transactions: Transaction[] = [
  {
    id: 1,
    description: "Quota associativa",
    category: "Entrata",
    date: "30/06/2026",
    amount: 50,
    type: "income",
    status: "completed",
  },
  {
    id: 2,
    description: "Acquisto materiale",
    category: "Uscita",
    date: "29/06/2026",
    amount: 120,
    type: "expense",
    status: "completed",
  },
  {
    id: 3,
    description: "Donazione",
    category: "Entrata",
    date: "28/06/2026",
    amount: 250,
    type: "income",
    status: "pending",
  },
  {
    id: 4,
    description: "Affitto sala",
    category: "Uscita",
    date: "27/06/2026",
    amount: 180,
    type: "expense",
    status: "completed",
  },
  {
    id: 5,
    description: "Sponsor evento",
    category: "Entrata",
    date: "26/06/2026",
    amount: 500,
    type: "income",
    status: "completed",
  },
];

function StatusBadge({
  status,
}: {
  status: TransactionStatus;
}) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        <CheckCircle2 size={14} />
        Completata
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
      <Clock3 size={14} />
      In attesa
    </span>
  );
}

export default function LatestTransactions() {
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

            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-t border-gray-100 transition-colors hover:bg-gray-50"
              >
                <td className="px-6 py-5">

                  <div className="flex items-center gap-4">

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        transaction.type === "income"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowDownLeft size={20} />
                      ) : (
                        <ArrowUpRight size={20} />
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {transaction.description}
                      </p>

                      <p className="text-xs text-gray-500">
                        Movimento finanziario
                      </p>
                    </div>

                  </div>

                </td>

                <td className="px-6 py-5 text-gray-600">
                  {transaction.category}
                </td>

                <td className="px-6 py-5 text-gray-600">
                  {transaction.date}
                </td>

                <td
                  className={`px-6 py-5 text-right text-base font-bold ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"} €
                  {transaction.amount.toFixed(2)}
                </td>

                <td className="px-6 py-5 text-center">
                  <StatusBadge status={transaction.status} />
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </section>
  );
}