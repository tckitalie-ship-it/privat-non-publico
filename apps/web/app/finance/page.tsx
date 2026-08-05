"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";

import { getAccessToken, API_URL } from "@/lib/api";

import FinanceSummary from "@/components/finance/FinanceSummary";
import FinanceForm from "@/components/finance/FinanceForm";
import FinanceTable from "@/components/finance/FinanceTable";
// -----------------------------
// Types reali
// -----------------------------
type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
   description?: string | null;
   category?: string | null;
  amountCents: number;
  date: string;
};

type Summary = {
  income: number;
  expense: number;
  balance: number;
};

// -----------------------------
// Page Component
// -----------------------------
export default function FinancePage() {
  // -----------------------------
  // State
  // -----------------------------
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    income: 0,
    expense: 0,
    balance: 0,
  });

 const [, setLoading] = useState(true);

  // Form state (reale)
  const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  // -----------------------------
  // Fetch Summary
  // -----------------------------
  const fetchSummary = useCallback(async () => {
    try {
      const token = getAccessToken();

      const res = await fetch(`${API_URL}/finances/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Errore nel recupero del summary");

      const data = await res.json();
      setSummary(data);
    } catch {
      toast.error("Impossibile caricare il riepilogo finanziario");
    }
  }, []);

  // -----------------------------
  // Fetch Transactions
  // -----------------------------
  const fetchTransactions = useCallback(async () => {
    try {
      const token = getAccessToken();

      const res = await fetch(`${API_URL}/finances/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Errore nel recupero delle transazioni");

      const data = await res.json();
      setTransactions(data);
    } catch {
      toast.error("Impossibile caricare le transazioni");
    }
  }, []);

  // -----------------------------
  // Initial Load
  // -----------------------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchTransactions()]);
      setLoading(false);
    };
    load();
  }, [fetchSummary, fetchTransactions]);

  // -----------------------------
  // Create Transaction
  // -----------------------------
  const createTransaction = useCallback(async () => {
    if (!description.trim() || !category.trim() || !amount.trim()) {
      toast.error("Compila tutti i campi");
      return;
    }

    try {
      const token = getAccessToken();

      const res = await fetch(`${API_URL}/finances/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          description,
          category,
          amountCents: Number(amount) * 100,
        }),
      });

      if (!res.ok) throw new Error("Errore nella creazione della transazione");

      toast.success("Transazione aggiunta");

      // Reset form
      setDescription("");
      setCategory("");
      setAmount("");

      // Refresh
      await Promise.all([fetchSummary(), fetchTransactions()]);
    } catch {
      toast.error("Errore durante la creazione");
    }
  }, [type, description, category, amount, fetchSummary, fetchTransactions]);

  // -----------------------------
  // Delete Transaction
  // -----------------------------
  const deleteTransaction = useCallback(
    async (id: string) => {
      try {
        const token = getAccessToken();

        const res = await fetch(`${API_URL}/finances/transactions/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Errore nella cancellazione");

        toast.success("Transazione eliminata");

        await Promise.all([fetchSummary(), fetchTransactions()]);
      } catch {
        toast.error("Errore durante l'eliminazione");
      }
    },
    [fetchSummary, fetchTransactions]
  );

  // -----------------------------
  // Memoized Stats
  // -----------------------------
  const stats = useMemo(
    () => ({
      income: summary.income,
      expense: summary.expense,
      balance: summary.balance,
    }),
    [summary]
  );

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="space-y-10">
      {/* Summary */}
      <FinanceSummary
        income={stats.income}
        expense={stats.expense}
        balance={stats.balance}
      />

      {/* Form */}
      <FinanceForm
        type={type}
        description={description}
        category={category}
        amount={amount}
        setType={setType}
        setDescription={setDescription}
        setCategory={setCategory}
        setAmount={setAmount}
        onSubmit={createTransaction}
      />

      {/* Table */}
      <FinanceTable
        transactions={transactions}
        onDelete={deleteTransaction}
      />
    </div>
  );
}
