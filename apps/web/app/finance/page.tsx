"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { toast } from "sonner";

import { getAccessToken } from "@/lib/api";
import {
  getActiveAssociationId,
} from "@/lib/association";

import FinanceSummary from "@/components/finance/FinanceSummary";
import FinanceForm from "@/components/finance/FinanceForm";
import FinanceTable from "@/components/finance/FinanceTable";

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

export default function FinancePage() {
  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [summary, setSummary] =
    useState<Summary>({
      income: 0,
      expense: 0,
      balance: 0,
    });

  const [, setLoading] =
    useState(true);

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

  // -----------------------------
  // Fetch Summary
  // -----------------------------
  const fetchSummary = useCallback(
    async () => {
      try {
        const token =
          getAccessToken();

        const associationId =
          getActiveAssociationId();

        if (
          !token ||
          !associationId
        ) {
          return;
        }

        const res = await fetch(
          `/api/finances/summary/${associationId}`,
          {
            headers: {
              Accept:
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        if (!res.ok) {
          throw new Error(
            "Errore nel recupero del riepilogo",
          );
        }

        const data =
          await res.json();

        setSummary({
          income:
            data.totalIncome ?? 0,
          expense:
            data.totalExpense ?? 0,
          balance:
            data.balance ?? 0,
        });
      } catch {
        toast.error(
          "Impossibile caricare il riepilogo finanziario",
        );
      }
    },
    [],
  );

  // -----------------------------
  // Fetch Transactions
  // -----------------------------
  const fetchTransactions =
    useCallback(
      async () => {
        try {
          const token =
            getAccessToken();

          const associationId =
            getActiveAssociationId();

          if (
            !token ||
            !associationId
          ) {
            setTransactions([]);
            return;
          }

          const res = await fetch(
            `/api/finances/association/${associationId}`,
            {
              headers: {
                Accept:
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
              cache: "no-store",
            },
          );

          if (!res.ok) {
            throw new Error(
              "Errore nel recupero delle transazioni",
            );
          }

          const data =
            await res.json();

          setTransactions(
            Array.isArray(data)
              ? data
              : [],
          );
        } catch {
          toast.error(
            "Impossibile caricare le transazioni",
          );
        }
      },
      [],
    );

  // -----------------------------
  // Initial Load
  // -----------------------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      await Promise.all([
        fetchSummary(),
        fetchTransactions(),
      ]);

      setLoading(false);
    };

    void load();
  }, [
    fetchSummary,
    fetchTransactions,
  ]);

  // -----------------------------
  // Create Transaction
  // -----------------------------
  const createTransaction =
    useCallback(
      async () => {
        if (
          !description.trim() ||
          !category.trim() ||
          !amount.trim()
        ) {
          toast.error(
            "Compila tutti i campi",
          );
          return;
        }

        try {
          const token =
            getAccessToken();

          const associationId =
            getActiveAssociationId();

          if (
            !token ||
            !associationId
          ) {
            toast.error(
              "Sessione o associazione non disponibile",
            );
            return;
          }

          const numericAmount =
            Number(
              amount.replace(",", "."),
            );

          if (
            !Number.isFinite(
              numericAmount,
            ) ||
            numericAmount <= 0
          ) {
            toast.error(
              "Inserisci un importo valido",
            );
            return;
          }

          const res = await fetch(
            "/api/finances",
            {
              method: "POST",
              headers: {
                Accept:
                  "application/json",
                "Content-Type":
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
              body: JSON.stringify({
                associationId,
                type,
                description:
                  description.trim(),
                category:
                  category.trim(),
                amountCents:
                  Math.round(
                    numericAmount * 100,
                  ),
                date:
                  new Date().toISOString(),
              }),
              cache: "no-store",
            },
          );

          const data =
            await res
              .json()
              .catch(() => null);

          if (!res.ok) {
            throw new Error(
              data?.message ??
                "Errore nella creazione della transazione",
            );
          }

          toast.success(
            "Transazione aggiunta",
          );

          setDescription("");
          setCategory("");
          setAmount("");

          await Promise.all([
            fetchSummary(),
            fetchTransactions(),
          ]);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Errore durante la creazione",
          );
        }
      },
      [
        type,
        description,
        category,
        amount,
        fetchSummary,
        fetchTransactions,
      ],
    );

  // -----------------------------
  // Delete Transaction
  // -----------------------------
  const deleteTransaction =
    useCallback(
      async (id: string) => {
        try {
          const token =
            getAccessToken();

          if (!token) {
            toast.error(
              "Sessione non disponibile",
            );
            return;
          }

          const res = await fetch(
            `/api/finances/${id}`,
            {
              method: "DELETE",
              headers: {
                Accept:
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
              cache: "no-store",
            },
          );

          const data =
            await res
              .json()
              .catch(() => null);

          if (!res.ok) {
            throw new Error(
              data?.message ??
                "Errore nella cancellazione",
            );
          }

          toast.success(
            "Transazione eliminata",
          );

          await Promise.all([
            fetchSummary(),
            fetchTransactions(),
          ]);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Errore durante l'eliminazione",
          );
        }
      },
      [
        fetchSummary,
        fetchTransactions,
      ],
    );

  const stats = useMemo(
    () => ({
      income:
        summary.income,
      expense:
        summary.expense,
      balance:
        summary.balance,
    }),
    [summary],
  );

  return (
    <div className="space-y-10">
      <FinanceSummary
        income={stats.income}
        expense={stats.expense}
        balance={stats.balance}
      />

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

      <FinanceTable
        transactions={transactions}
        onDelete={deleteTransaction}
      />
    </div>
  );
}