export type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  description: string;
  category: string;
  amountCents: number;
  date: string;
};
