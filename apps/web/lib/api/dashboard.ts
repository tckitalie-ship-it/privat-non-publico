import { getAccessToken } from "@/lib/api";

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
  pendingInvitations: number;
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
  const data = await authenticatedGet("/dashboard/kpis");

  return {
    associationsCount: 0,
    membersCount: data?.totalMembers ?? 0,
    eventsCount: 0,
    usersCount: 0,
    transactionsCount: 0,
    eventRegistrationsCount: 0,
    incomeCents: data?.monthlyIncome ?? 0,
    expenseCents: data?.monthlyExpenses ?? 0,
    balanceCents:
      (data?.monthlyIncome ?? 0) -
      (data?.monthlyExpenses ?? 0),
    newMembersThisMonth: 0,
    upcomingEvents: data?.activeEvents ?? 0,
    pendingInvitations: data?.pendingInvitations ?? 0,
  };
}

export async function fetchFinanceTrend(): Promise<
  FinanceTrendItem[]
> {
  return authenticatedGet("/dashboard/finance-trend");
}

export async function fetchEventsTrend(): Promise<
  MembersTrendItem[]
> {
  return authenticatedGet("/dashboard/events-trend");
}

export async function fetchMembersTrend(): Promise<
  MembersTrendItem[]
> {
  return authenticatedGet("/dashboard/members-trend");
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

export async function fetchLatestTransactions(): Promise<
  LatestTransaction[]
> {
  const data = await authenticatedGet(
    "/dashboard/latest-transactions",
  );

  return Array.isArray(data) ? data : [];
}