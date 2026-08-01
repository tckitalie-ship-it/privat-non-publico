"use client";

import * as XLSX from "xlsx";

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
  const exportExcel = () => {
    if (!transactions.length) return;

    const rows = transactions.map((t) => ({
      Data: new Date(t.date).toLocaleDateString(),
      Tipo: t.type === "INCOME" ? "Entrata" : "Uscita",
      Categoria: t.category,
      Descrizione: t.description,
      "Importo (€)": (t.amountCents / 100).toFixed(2),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Finanze");

    XLSX.writeFile(workbook, "finanze.xlsx");
  };

  return (
    <button
      onClick={exportExcel}
      className="rounded-md bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700"
    >
      Esporta Excel
    </button>
  );
}
