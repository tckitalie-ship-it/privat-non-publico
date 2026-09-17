"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Download,
  Loader2,
} from "lucide-react";
import writeExcelFile from "write-excel-file/browser";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  description?: string | null;
  category?: string | null;
  amountCents: number;
  date: string;
};

export default function FinanceExportExcel({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [loading, setLoading] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  async function exportExcel() {
    if (
      !transactions.length ||
      loading
    ) {
      return;
    }

    try {
      setLoading(true);
      setCompleted(false);

      const sheetData = [
        [
          "Data",
          "Tipo",
          "Categoria",
          "Descrizione",
          "Importo (€)",
        ],

        ...transactions.map(
          (transaction) => {
            const parsedDate =
              new Date(
                transaction.date,
              );

            return [
              Number.isNaN(
                parsedDate.getTime(),
              )
                ? ""
                : parsedDate.toLocaleDateString(
                    "it-IT",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    },
                  ),

              transaction.type ===
              "INCOME"
                ? "Entrata"
                : "Uscita",

              transaction.category?.trim() ??
                "",

              transaction.description?.trim() ??
                "",

              transaction.amountCents /
                100,
            ];
          },
        ),
      ];

      await writeExcelFile(
        [
          {
            data: sheetData,
            sheet: "Finanze",
          },
        ],
      ).toFile(
        `finanze-${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`,
      );

      setCompleted(true);

      window.setTimeout(() => {
        setCompleted(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Errore esportazione Excel:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => {
        void exportExcel();
      }}
      disabled={
        !transactions.length ||
        loading
      }
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#1e293b] px-4 py-2.5 font-semibold text-white transition hover:border-white/20 hover:bg-[#263449] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? (
        <>
          <Loader2
            size={17}
            className="animate-spin"
          />
          Esportazione...
        </>
      ) : completed ? (
        <>
          <CheckCircle2
            size={17}
            className="text-emerald-300"
          />
          Esportato
        </>
      ) : (
        <>
          <Download size={17} />
          Esporta Excel
        </>
      )}
    </button>
  );
}