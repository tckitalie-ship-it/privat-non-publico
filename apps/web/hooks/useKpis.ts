"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  API_URL,
  getAccessToken,
} from "@/lib/api";

type DashboardKpiData = {
  membersCount: number;
  pendingInvitations: number;
  incomeCents: number;
  expenseCents: number;
  upcomingEvents: number;
};

type DashboardKpiResponse = {
  totalMembers?: number;
  pendingInvitations?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  activeEvents?: number;
};

async function requestKpis(): Promise<DashboardKpiData> {
  const token = getAccessToken();

  const response = await fetch(
    `${API_URL}/dashboard/kpis`,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Errore API KPI: ${response.status}`,
    );
  }

  const result =
    (await response.json()) as DashboardKpiResponse;

  return {
    membersCount: result.totalMembers ?? 0,
    pendingInvitations:
      result.pendingInvitations ?? 0,
    incomeCents: result.monthlyIncome ?? 0,
    expenseCents:
      result.monthlyExpenses ?? 0,
    upcomingEvents: result.activeEvents ?? 0,
  };
}

export function useKpis() {
  const [data, setData] =
    useState<DashboardKpiData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const fetchKpis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await requestKpis();

      setData(result);
    } catch (error) {
      console.error("Errore KPI:", error);

      setData(null);
      setError(
        error instanceof Error
          ? error.message
          : "Impossibile caricare i KPI",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initializeKpis() {
      try {
        const result = await requestKpis();

        if (cancelled) {
          return;
        }

        setData(result);
        setError(null);
      } catch (error) {
        console.error("Errore KPI:", error);

        if (cancelled) {
          return;
        }

        setData(null);
        setError(
          error instanceof Error
            ? error.message
            : "Impossibile caricare i KPI",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initializeKpis();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    data,
    loading,
    error,
    fetchKpis,
  };
}