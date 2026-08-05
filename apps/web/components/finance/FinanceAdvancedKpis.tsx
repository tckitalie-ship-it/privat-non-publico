"use client";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  date: string;
};

export default function FinanceAdvancedKpis({
  transactions,
}: {
  transactions: Transaction[];
}) {
  if (!transactions.length) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-gray-500">Nessun dato disponibile</p>
      </div>
    );
  }

  // Raggruppa per mese
  const monthlyMap: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((t) => {
    const month = t.date.slice(0, 7);
    if (!monthlyMap[month]) {
      monthlyMap[month] = { income: 0, expense: 0 };
    }
    if (t.type === "INCOME") monthlyMap[month].income += t.amountCents / 100;
    else monthlyMap[month].expense += t.amountCents / 100;
  });

  const months = Object.keys(monthlyMap).sort();
  const incomeValues = months.map((m) => monthlyMap[m].income);
  const expenseValues = months.map((m) => monthlyMap[m].expense);

  // Burn rate = media delle uscite mensili
  const burnRate =
    expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length;

  // Cashflow netto = entrate totali - uscite totali
  const totalIncome = incomeValues.reduce((a, b) => a + b, 0);
  const totalExpense = expenseValues.reduce((a, b) => a + b, 0);
  const netCashflow = totalIncome - totalExpense;

  // Runway = saldo attuale / burn rate
  const runway = burnRate > 0 ? netCashflow / burnRate : 0;

  // ROI operativo = (entrate - uscite) / uscite
  const roi = totalExpense > 0 ? (netCashflow / totalExpense) * 100 : 0;

  // Margine operativo = (profitto / entrate)
  const margin = totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0;

  // Deviazione standard entrate
  const incomeStd = stdDeviation(incomeValues);

  // Deviazione standard uscite
  const expenseStd = stdDeviation(expenseValues);

  // Crescita annualizzata
  const growthRate =
    incomeValues.length > 1
      ? ((incomeValues[incomeValues.length - 1] -
          incomeValues[0]) /
          incomeValues[0]) *
        100
      : 0;

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <Kpi label="Burn Rate (mensile)" value={burnRate} color="text-red-600" />
      <Kpi label="Runway (mesi)" value={runway} color="text-blue-600" />
      <Kpi label="Cashflow Netto" value={netCashflow} color="text-green-600" />

      <Kpi label="ROI Operativo (%)" value={roi} percent />
      <Kpi label="Margine Operativo (%)" value={margin} percent />
      <Kpi label="Crescita Annualizzata (%)" value={growthRate} percent />

      <Kpi label="Stabilità Entrate (σ)" value={incomeStd} />
      <Kpi label="Stabilità Uscite (σ)" value={expenseStd} />
    </div>
  );
}

function stdDeviation(values: number[]) {
  if (values.length <= 1) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function Kpi({
  label,
  value,
  color,
  percent,
}: {
  label: string;
  value: number;
  color?: string;
  percent?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color || ""}`}>
        {percent ? `${value.toFixed(1)}%` : `€ ${value.toFixed(2)}`}
      </p>
    </div>
  );
}
