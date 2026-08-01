"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import FinanceExportCSV from "@/components/finance/FinanceExportCSV";
import FinanceExportExcel from "@/components/finance/FinanceExportExcel";
import FinanceForm from "@/components/finance/FinanceForm";
import FinanceKpis from "@/components/finance/FinanceKpis";
import FinanceSummary from "@/components/finance/FinanceSummary";
import FinanceTable from "@/components/finance/FinanceTable";

import EditFinanceModal, {
  type FinanceTransaction,
} from "@/components/finance/EditFinanceModal";

import {
  API_URL,
  getAccessToken,
} from "@/lib/api";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  title?: string | null;
  description?: string | null;
  category?: string | null;
  amountCents: number;
  date: string;
};

type JwtPayload = {
  sub?: string;
  email?: string;
  associationId?: string | null;
  role?: string | null;
};

function getAssociationIdFromToken(
  token: string,
): string | null {
  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return null;
    }

    const normalized = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = normalized.padEnd(
      normalized.length +
        ((4 - (normalized.length % 4)) % 4),
      "=",
    );

    const payload = JSON.parse(
      window.atob(padded),
    ) as JwtPayload;

    return payload.associationId ?? null;
  } catch (error) {
    console.error(
      "Errore lettura associationId dal token:",
      error,
    );

    return null;
  }
}

export default function FinancePage() {
  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [loading, setLoading] =
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

  const [editOpen, setEditOpen] =
    useState(false);

  const [
    editingTransaction,
    setEditingTransaction,
  ] =
    useState<FinanceTransaction | null>(
      null,
    );

  const [editLoading, setEditLoading] =
    useState(false);

  const summary = useMemo(() => {
    const income = transactions
      .filter(
        (transaction) =>
          transaction.type === "INCOME",
      )
      .reduce(
        (total, transaction) =>
          total +
          transaction.amountCents,
        0,
      );

    const expense = transactions
      .filter(
        (transaction) =>
          transaction.type ===
          "EXPENSE",
      )
      .reduce(
        (total, transaction) =>
          total +
          transaction.amountCents,
        0,
      );

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);

  const loadTransactions =
    useCallback(async () => {
      const token = getAccessToken();

      if (!token) {
        toast.error(
          "Sessione non disponibile",
        );
        setLoading(false);
        return;
      }

      const associationId =
        getAssociationIdFromToken(token);

      if (!associationId) {
        toast.error(
          "Nessuna associazione attiva selezionata",
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/finances/association/${associationId}`,
          {
            headers: {
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
            ? (data as Transaction[])
            : [],
        );
      } catch (error) {
        console.error(
          "Errore caricamento transazioni:",
          error,
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Impossibile caricare le transazioni",
        );
      } finally {
        setLoading(false);
      }
    }, []);

      useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void loadTransactions();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [loadTransactions]);

  const createTransaction =
    useCallback(async () => {
      const cleanDescription =
        description.trim();

      const cleanCategory =
        category.trim();

      const numericAmount = Number(
        amount.replace(",", "."),
      );

      if (
        !cleanDescription ||
        !cleanCategory ||
        !Number.isFinite(
          numericAmount,
        ) ||
        numericAmount <= 0
      ) {
        toast.error(
          "Compila correttamente tutti i campi",
        );
        return;
      }

      const token = getAccessToken();

      if (!token) {
        toast.error(
          "Sessione non disponibile",
        );
        return;
      }

      const associationId =
        getAssociationIdFromToken(token);

      if (!associationId) {
        toast.error(
          "Nessuna associazione attiva selezionata",
        );
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/finances`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              associationId,
              type,
              title: cleanDescription,
              description:
                cleanDescription,
              category: cleanCategory,
              amountCents: Math.round(
                numericAmount * 100,
              ),
              date: new Date().toISOString(),
            }),
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
              `Errore creazione transazione (${response.status})`,
          );
        }

        toast.success(
          "Transazione aggiunta",
        );

        setDescription("");
        setCategory("");
        setAmount("");

        await loadTransactions();

        localStorage.setItem(
          "kpisUpdated",
          Date.now().toString(),
        );
      } catch (error) {
        console.error(
          "Errore creazione transazione:",
          error,
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Impossibile creare la transazione",
        );
      }
    }, [
      amount,
      category,
      description,
      loadTransactions,
      type,
    ]);

  const deleteTransaction =
    useCallback(
      async (id: string) => {
        const token = getAccessToken();

        if (!token) {
          toast.error(
            "Sessione non disponibile",
          );
          return;
        }

        try {
          const response = await fetch(
            `${API_URL}/finances/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const data = await response
            .json()
            .catch(() => null);

          if (!response.ok) {
            const message =
              Array.isArray(
                data?.message,
              )
                ? data.message.join(", ")
                : data?.message;

            throw new Error(
              message ||
                `Errore eliminazione transazione (${response.status})`,
            );
          }

          toast.success(
            "Transazione eliminata",
          );

          await loadTransactions();

          localStorage.setItem(
            "kpisUpdated",
            Date.now().toString(),
          );
        } catch (error) {
          console.error(
            "Errore eliminazione transazione:",
            error,
          );

          toast.error(
            error instanceof Error
              ? error.message
              : "Impossibile eliminare la transazione",
          );
        }
      },
      [loadTransactions],
    );

  const updateTransaction =
    useCallback(
      async (data: {
        type:
          | "INCOME"
          | "EXPENSE";
        description: string;
        category: string;
        amountCents: number;
      }) => {
        if (!editingTransaction) {
          toast.error(
            "Transazione non disponibile",
          );
          return;
        }

        const cleanDescription =
          data.description.trim();

        const cleanCategory =
          data.category.trim();

        if (
          !cleanDescription ||
          !cleanCategory ||
          !Number.isFinite(
            data.amountCents,
          ) ||
          data.amountCents <= 0
        ) {
          toast.error(
            "Compila correttamente tutti i campi",
          );
          return;
        }

        const token =
          getAccessToken();

        if (!token) {
          toast.error(
            "Sessione non disponibile",
          );
          return;
        }

        try {
          setEditLoading(true);

          const response = await fetch(
            `${API_URL}/finances/${editingTransaction.id}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                type: data.type,
                title:
                  cleanDescription,
                description:
                  cleanDescription,
                category:
                  cleanCategory,
                amountCents:
                  data.amountCents,
              }),
            },
          );

          const responseData =
            await response
              .json()
              .catch(() => null);

          if (!response.ok) {
            const message =
              Array.isArray(
                responseData?.message,
              )
                ? responseData.message.join(
                    ", ",
                  )
                : responseData?.message;

            throw new Error(
              message ||
                `Errore modifica transazione (${response.status})`,
            );
          }

          toast.success(
            "Transazione aggiornata",
          );

          setEditOpen(false);
          setEditingTransaction(null);

          await loadTransactions();

          localStorage.setItem(
            "kpisUpdated",
            Date.now().toString(),
          );
        } catch (error) {
          console.error(
            "Errore modifica transazione:",
            error,
          );

          toast.error(
            error instanceof Error
              ? error.message
              : "Impossibile modificare la transazione",
          );
        } finally {
          setEditLoading(false);
        }
      },
      [
        editingTransaction,
        loadTransactions,
      ],
    );

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-8 text-gray-300">
        Caricamento dati finanziari...
      </div>
    );
  }

  const tableTransactions =
    transactions.map(
      (transaction) => ({
        ...transaction,
        description:
          transaction.description ??
          transaction.title ??
          "Movimento finanziario",
        category:
          transaction.category ??
          "Senza categoria",
      }),
    );

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
          Finanze
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Gestione finanziaria
        </h1>

        <p className="mt-2 text-gray-400">
          Registra entrate e uscite e
          controlla il saldo
          dell&apos;associazione.
        </p>
      </div>

      <FinanceSummary
        income={summary.income}
        expense={summary.expense}
        balance={summary.balance}
      />

      <FinanceKpis
        transactions={transactions}
      />

      <FinanceForm
        type={type}
        description={description}
        category={category}
        amount={amount}
        setType={setType}
        setDescription={
          setDescription
        }
        setCategory={setCategory}
        setAmount={setAmount}
        onSubmit={createTransaction}
      />

      <section className="flex flex-wrap gap-3">
        <FinanceExportCSV
          transactions={transactions}
        />

        <FinanceExportExcel
          transactions={transactions}
        />
      </section>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-8 text-center">
          <p className="font-semibold text-white">
            Nessuna transazione presente
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Registra la prima entrata o
            uscita usando il modulo qui
            sopra.
          </p>
        </div>
      ) : (
        <FinanceTable
          transactions={tableTransactions}
          onDelete={deleteTransaction}
          onEdit={(transaction) => {
            setEditingTransaction({
              id: transaction.id,
              type: transaction.type,
              description: transaction.description ?? "",
              category: transaction.category ?? "",
              amountCents: transaction.amountCents,
            });

            setEditOpen(true);
          }}
        />
      )}

      <EditFinanceModal
        open={editOpen}
        transaction={
          editingTransaction
        }
        loading={editLoading}
        onClose={() => {
          if (editLoading) {
            return;
          }

          setEditOpen(false);
          setEditingTransaction(
            null,
          );
        }}
        onSave={
          updateTransaction
        }
      />
    </div>
  );
}