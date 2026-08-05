"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  date: string;
};

function getSeason(month: number): string {
  if ([12, 1, 2].includes(month)) return "Inverno";
  if ([3, 4, 5].includes(month)) return "Primavera";
  if ([6, 7, 8].includes(month)) return "Estate";
  return "Autunno";
}

export default function FinanceSeasonalAnalysis({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const seasonalMap: Record<
    string,
    { income: number; expense: number }
  > = {
    Inverno: { income: 0, expense: 0 },
    Primavera: { income: 0, expense: 0 },
    Estate: { income: 0, expense: 0 },
    Autunno: { income: 0, expense: 0 },
  };

  transactions.forEach((t) => {
    const month = new Date(t.date).getMonth() + 1;
    const season = getSeason(month);

    if (t.type === "INCOME") {
      seasonalMap[season].income += t.amountCents / 100;
    } else {
      seasonalMap[season].expense += t.amountCents / 100;
    }
  });

  const data = Object.entries(seasonalMap).map(([season, values]) => ({
    season,
    income: values.income,
    expense: values.expense,
    balance: values.income - values.expense,
  }));

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-lg font-semibold">Analisi Stagionale Finanziaria</h2>

      {/* KPI */}
      <div className="grid gap-6 sm:grid-cols-3">
        {data.map((d) => (
          <div
            key={d.season}
            className="rounded-xl border bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-gray-500">{d.season}</p>
            <p className="mt-2 text-green-600 font-bold">
              Entrate: € {d.income.toFixed(2)}
            </p>
            <p className="text-red-600 font-bold">
              Uscite: € {d.expense.toFixed(2)}
            </p>
            <p
              className={`font-bold ${
                d.balance >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              Bilancio: € {d.balance.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Grafico */}
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="season" />
            <YAxis tickFormatter={(v) => `€${v}`} />
            <Tooltip formatter={(v) => `€${v}`} />
            <Legend />

            <Bar
              dataKey="income"
              name="Entrate"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expense"
              name="Uscite"
              fill="#dc2626"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="balance"
              name="Bilancio"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
