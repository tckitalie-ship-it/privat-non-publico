"use client";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  description: string;
  category: string;
  amountCents: number;
  date: string;
};

export default function FinancePDFReport({
  transactions,
  summary,
}: {
  transactions: Transaction[];
  summary: {
    income: number;
    expense: number;
    balance: number;
  };
}) {
  const generatePDF = () => {
    const html = `
      <html>
        <head>
          <title>Report Finanziario</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { font-size: 22px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; font-size: 12px; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>Report Finanziario Associazione</h1>
          <p>Generato il: ${new Date().toLocaleDateString()}</p>

          <h2>Riepilogo</h2>
          <table>
            <tr>
              <th>Entrate (€)</th>
              <th>Uscite (€)</th>
              <th>Bilancio (€)</th>
            </tr>
            <tr>
              <td>${(summary.income / 100).toFixed(2)}</td>
              <td>${(summary.expense / 100).toFixed(2)}</td>
              <td>${(summary.balance / 100).toFixed(2)}</td>
            </tr>
          </table>

          <h2>Transazioni</h2>
          <table>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Descrizione</th>
              <th>Importo (€)</th>
            </tr>
            ${transactions
              .map(
                (t) => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.type === "INCOME" ? "Entrata" : "Uscita"}</td>
                <td>${t.category}</td>
                <td>${t.description}</td>
                <td>${(t.amountCents / 100).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const win = window.open(url, "_blank");
    win?.print();
  };

  return (
    <button
      onClick={generatePDF}
      className="rounded-md bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700"
    >
      Genera PDF
    </button>
  );
}
