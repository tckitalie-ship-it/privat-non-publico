"use client";

import { Download } from "lucide-react";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  description?: string | null;
  category?: string | null;
  amountCents: number;
  date: string;
};

function escapeCSV(value: string) {
  return `"${value
    .replace(/"/g, '""')
    .replace(/\r?\n/g, " ")}"`;
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString(
    "it-IT",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );
}

export default function FinanceExportCSV({
  transactions,
}: {
  transactions: Transaction[];
}) {
  function exportCSV() {
    if (!transactions.length) {
      return;
    }

    const header = [
      "Data",
      "Tipo",
      "Categoria",
      "Descrizione",
      "Importo (€)",
    ];

    const rows = transactions.map(
      (transaction) => [
        formatDate(transaction.date),

        transaction.type === "INCOME"
          ? "Entrata"
          : "Uscita",

        transaction.category?.trim() ??
          "",

        transaction.description?.trim() ??
          "",

        (transaction.amountCents / 100)
          .toFixed(2)
          .replace(".", ","),
      ],
    );

    const csvContent = [
      header,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            escapeCSV(value),
          )
          .join(";"),
      )
      .join("\r\n");

    const blob = new Blob(
      [
        "\uFEFF",
        csvContent,
      ],
      {
        type: "text/csv;charset=utf-8;",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      `finanze-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportCSV}
      disabled={!transactions.length}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#1e293b] px-4 py-2.5 font-semibold text-white transition hover:border-white/20 hover:bg-[#263449] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Download size={17} />
      Esporta CSV
    </button>
  );
}