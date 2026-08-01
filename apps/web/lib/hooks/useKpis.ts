"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  fetchKpis as fetchDashboardKpis,
  type DashboardKpisData,
} from "@/lib/api/dashboard";

export function useKpis() {
  const [data, setData] =
    useState<DashboardKpisData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadKpis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result =
        await fetchDashboardKpis();

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
        const result =
          await fetchDashboardKpis();

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
    fetchKpis: loadKpis,
  };
}