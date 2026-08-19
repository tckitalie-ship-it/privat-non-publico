"use client";

import {
  CheckCircle2,
  Database,
  Server,
  ShieldCheck,
  Wifi,
} from "lucide-react";

const status = [
  {
    title: "Backend",
    value: "Online",
    description: "Servizio applicativo disponibile",
    icon: Server,
    color:
      "bg-green-500/10 text-green-400 border-green-500/20",
  },
  {
    title: "Database",
    value: "Connesso",
    description: "Connessione al database attiva",
    icon: Database,
    color:
      "bg-green-500/10 text-green-400 border-green-500/20",
  },
  {
    title: "API",
    value: "Operativa",
    description: "Endpoint disponibili",
    icon: Wifi,
    color:
      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    title: "Sicurezza",
    value: "Protetta",
    description: "Autenticazione e autorizzazioni attive",
    icon: ShieldCheck,
    color:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
] as const;

export default function SystemStatus() {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] shadow-xl">
      <div className="border-b border-white/10 px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
          Infrastruttura
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Stato del sistema
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Monitoraggio dei principali servizi della
          piattaforma.
        </p>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
        {status.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${item.color}`}
                >
                  <Icon size={23} />
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Attivo
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {item.description}
              </p>

              <div className="mt-5 flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-green-400"
                />

                <span className="text-sm font-medium text-gray-300">
                  {item.value}
                </span>
              </div>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className="h-full w-full rounded-full bg-green-500/70" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/10 px-6 py-4">
        <div className="flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Tutti i servizi principali risultano
            disponibili.
          </span>

          <span className="inline-flex items-center gap-2 text-green-400">
            <CheckCircle2 size={14} />
            Sistema operativo
          </span>
        </div>
      </div>
    </section>
  );
}