"use client";

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
  const exportExcel = async () => {
    if (!transactions.length) return;

    const sheetData = [
      ["Data", "Tipo", "Categoria", "Descrizione", "Importo (€)"],
      ...transactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.type === "INCOME" ? "Entrata" : "Uscita",
        t.category ?? "",
        t.description ?? "",
        t.amountCents / 100,
      ]),
    ];

    await writeExcelFile([{ data: sheetData, sheet: "Finanze" }]).toFile("finanze.xlsx");
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
