"use client";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";

export interface TransactionItem {
  id: string;
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category?: string;
  createdAt: string;
}

interface TransactionCardProps {
  transaction: TransactionItem;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function TransactionCard({
  transaction,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const income = transaction.type === "INCOME";

  return (
    <div className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl transition hover:border-emerald-500/40">

      <div className="flex items-start justify-between">

        <div>

          <h3 className="text-xl font-bold text-white">
            {transaction.title}
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            {transaction.category || "Categoria non specificata"}
          </p>

        </div>

        {income ? (
          <ArrowUpCircle className="h-8 w-8 text-emerald-400" />
        ) : (
          <ArrowDownCircle className="h-8 w-8 text-red-400" />
        )}

      </div>

      <div className="mt-6 flex items-center gap-2 text-sm text-gray-300">
        <Calendar size={18} />

        {new Date(transaction.createdAt).toLocaleString("it-IT")}
      </div>

      <div
        className={`mt-6 text-3xl font-bold ${
          income ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {income ? "+" : "-"} € {transaction.amount.toFixed(2)}
      </div>

      <div className="mt-6 flex gap-3">

        <button
          onClick={() => onEdit?.(transaction.id)}
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/20 px-4 py-2 text-indigo-300 transition hover:bg-indigo-500/10"
        >
          <Pencil size={16} />
          Modifica
        </button>

        <button
          onClick={() => onDelete?.(transaction.id)}
          className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2 text-red-300 transition hover:bg-red-500/10"
        >
          <Trash2 size={16} />
          Elimina
        </button>

      </div>

    </div>
  );
}