"use client";

import {
  fetchFinanceTrend,
  fetchMembersTrend,
  type FinanceTrendItem,
  type MembersTrendItem,
} from "@/lib/api/dashboard";

import { useCallback, useEffect, useState } from "react";

import { DashboardKpis } from "@/components/dashboard/DashboardKpis";
import FinanceBarChart from "@/components/dashboard/FinanceBarChart";
import FinanceTrendChart from "@/components/dashboard/FinanceTrendChart";
import MembersTrendChart from "@/components/dashboard/MembersTrendChart";
import RevenueChart from "@/components/dashboard/RevenueChart";

import LatestTransactions from "@/components/dashboard/LatestTransactions";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SystemStatus from "@/components/dashboard/SystemStatus";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";

import { PageHeader } from "@/components/ui";

export default function DashboardPage() {
  const [financeData, setFinanceData] = useState<FinanceTrendItem[]>([]);
  const [membersData, setMembersData] = useState<MembersTrendItem[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [chartsError, setChartsError] = useState<string | null>(null);

  const loadCharts = useCallback(async () => {
    setLoadingCharts(true);
    setChartsError(null);

    try {
      const [finance, members] = await Promise.all([
        fetchFinanceTrend(),
        fetchMembersTrend(),
      ]);

      setFinanceData(Array.isArray(finance) ? finance : []);
      setMembersData(Array.isArray(members) ? members : []);
    } catch (error) {
      console.error("Errore caricamento grafici dashboard:", error);

      setFinanceData([]);
      setMembersData([]);

      setChartsError(
        error instanceof Error
          ? error.message
          : "Impossibile caricare i grafici",
      );
    } finally {
      setLoadingCharts(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCharts();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadCharts]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === "kpisUpdated") {
        void loadCharts();
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadCharts]);

  return (
    <div className="min-w-0 space-y-8">
      <PageHeader
        title="Dashboard Associazione"
        description="Benvenuto nella piattaforma di gestione. Da questa dashboard puoi monitorare membri, eventi, finanze e tutte le attività principali dell'associazione in tempo reale."
      />

      <DashboardKpis />

      <section className="min-w-0">
        {loadingCharts ? (
          <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-8 text-gray-300">
            Caricamento grafici...
          </div>
        ) : chartsError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="font-medium text-red-300">
              Impossibile caricare i grafici
            </p>

            <p className="mt-2 text-sm text-red-200/70">
              {chartsError}
            </p>

            <button
              type="button"
              onClick={() => void loadCharts()}
              className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400"
            >
              Riprova
            </button>
          </div>
        ) : (
          <div className="grid min-w-0 gap-6 xl:grid-cols-2">
            <div className="min-w-0">
              <RevenueChart data={financeData} />
            </div>

            <div className="min-w-0">
              <FinanceBarChart data={financeData} />
            </div>

            <div className="min-w-0">
              <FinanceTrendChart data={financeData} />
            </div>

            <div className="min-w-0">
              <MembersTrendChart data={membersData} />
            </div>
          </div>
        )}
      </section>

      <QuickActions />

      <section className="grid min-w-0 gap-6 2xl:grid-cols-2">
        <RecentActivity />
        <UpcomingEvents />
      </section>

      <LatestTransactions />

      <SystemStatus />
    </div>
  );
}
