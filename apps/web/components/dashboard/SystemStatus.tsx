"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Database,
  Server,
  Wifi,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type HealthResponse = {
  backend?: string;
  database?: string;
  api?: string;
  security?: string;
};

type StatusItem = {
  title: string;
  value: string;
  ok: boolean;
  icon: typeof Server;
};

export default function SystemStatus() {
  const [items, setItems] = useState<StatusItem[]>([
    {
      title: "Backend",
      value: "Controllo...",
      ok: false,
      icon: Server,
    },
    {
      title: "Database",
      value: "Controllo...",
      ok: false,
      icon: Database,
    },
    {
      title: "API",
      value: "Controllo...",
      ok: false,
      icon: Wifi,
    },
    {
      title: "Sicurezza",
      value: "Controllo...",
      ok: false,
      icon: ShieldCheck,
    },
  ]);

  useEffect(() => {
    async function loadHealth() {
      try {
        const response = await fetch(
          "http://127.0.0.1:3001/api/health",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data: HealthResponse | null =
          await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            "Health check non disponibile",
          );
        }

        setItems([
          {
            title: "Backend",
            value:
              data?.backend === "online"
                ? "Online"
                : "Offline",
            ok: data?.backend === "online",
            icon: Server,
          },
          {
            title: "Database",
            value:
              data?.database === "connected"
                ? "Connesso"
                : "Disconnesso",
            ok: data?.database === "connected",
            icon: Database,
          },
          {
            title: "API",
            value:
              data?.api === "operational"
                ? "Operativa"
                : "Degradata",
            ok: data?.api === "operational",
            icon: Wifi,
          },
          {
            title: "Sicurezza",
            value:
              data?.security === "protected"
                ? "Protetta"
                : "Da verificare",
            ok: data?.security === "protected",
            icon: ShieldCheck,
          },
        ]);
      } catch {
        setItems([
          {
            title: "Backend",
            value: "Offline",
            ok: false,
            icon: Server,
          },
          {
            title: "Database",
            value: "Non disponibile",
            ok: false,
            icon: Database,
          },
          {
            title: "API",
            value: "Non disponibile",
            ok: false,
            icon: Wifi,
          },
          {
            title: "Sicurezza",
            value: "Non disponibile",
            ok: false,
            icon: ShieldCheck,
          },
        ]);
      }
    }

    void loadHealth();
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Stato del sistema
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Monitoraggio dei principali servizi della piattaforma.
        </p>
      </div>

      <div className="grid gap-5 p-8 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  item.ok
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                <Icon size={26} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-gray-900">
                {item.title}
              </h3>

              <div className="mt-4 flex items-center gap-2">
                {item.ok ? (
                  <CheckCircle2
                    size={18}
                    className="text-green-600"
                  />
                ) : (
                  <XCircle
                    size={18}
                    className="text-red-600"
                  />
                )}

                <span className="font-medium text-gray-700">
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}