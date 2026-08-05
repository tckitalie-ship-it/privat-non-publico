"use client";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  description?: string | null;
  category?: string | null;
  amountCents: number;
  date: string;
};

export default function FinanceExportCSV({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const exportCSV = () => {
    if (!transactions.length) return;

    const header = [
      "Data",
      "Tipo",
      "Categoria",
      "Descrizione",
      "Importo (€)",
    ];

    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.type === "INCOME" ? "Entrata" : "Uscita",
      t.category ?? "",
      t.description ?? "",
      (t.amountCents / 100).toFixed(2),
    ]);

    const csvContent =
      [header, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "finanze.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportCSV}
      className="rounded-md bg-gray-800 px-4 py-2 text-white font-semibold hover:bg-gray-900"
    >
      Esporta CSV
    </button>
  );
}
