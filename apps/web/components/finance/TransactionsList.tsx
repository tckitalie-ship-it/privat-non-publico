"use client";

import TransactionCard, {
  TransactionItem,
} from "./TransactionCard";

interface TransactionsListProps {
  transactions: TransactionItem[];
  loading: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function TransactionsList({
  transactions,
  loading,
  onEdit,
  onDelete,
}: TransactionsListProps) {
  if (loading) {
    return (
      <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl">
        <div className="h-40 animate-pulse rounded-2xl bg-[#111827]" />
      </section>
    );
  }

  if (transactions.length === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl">
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#111827] p-10 text-center text-gray-400">
          Nessuna transazione trovata.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          Transazioni
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Elenco completo delle entrate e delle uscite.
        </p>
      </div>

      <div className="grid gap-5">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}