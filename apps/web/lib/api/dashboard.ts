import {
  API_URL,
  getAccessToken,
} from "@/lib/api";

export interface DashboardKpisData {
  associationsCount: number;
  membersCount: number;
  eventsCount: number;
  usersCount: number;
  transactionsCount: number;
  eventRegistrationsCount: number;
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
  newMembersThisMonth: number;
  upcomingEvents: number;
}

export interface FinanceTrendItem {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface MembersTrendItem {
  month: string;
  count: number;
}

async function authenticatedGet(path: string) {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Sessione non disponibile. Effettua nuovamente il login.",
    );
  }

  const response = await fetch(`/api${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message;

    throw new Error(
      message || `Errore API (${response.status})`,
    );
  }

  return data;
}

export async function fetchKpis(): Promise<DashboardKpisData> {
  return authenticatedGet("/dashboard/kpis");
}

export async function fetchFinanceTrend(): Promise<FinanceTrendItem[]> {
  return authenticatedGet("/dashboard/finance-trend");
}

export async function fetchEventsTrend(): Promise<MembersTrendItem[]> {
  return authenticatedGet("/dashboard/events-trend");
}

export async function fetchMembersTrend(): Promise<MembersTrendItem[]> {
  return authenticatedGet("/dashboard/events-trend");
}
export interface LatestTransaction {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchLatestTransactions(): Promise<LatestTransaction[]> {
  const data = await authenticatedGet(
    "/dashboard/latest-transactions",
  );

  return Array.isArray(data) ? data : [];
}
