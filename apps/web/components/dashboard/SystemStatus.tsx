"use client";

import {
  CheckCircle2,
  Database,
  Server,
  Wifi,
  ShieldCheck,
} from "lucide-react";

const status = [
  {
    title: "Backend",
    value: "Online",
    icon: Server,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Database",
    value: "Connesso",
    icon: Database,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "API",
    value: "Operativa",
    icon: Wifi,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Sicurezza",
    value: "Protetta",
    icon: ShieldCheck,
    color: "bg-emerald-100 text-emerald-600",
  },
];

export default function SystemStatus() {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white shadow-md">

      <div className="border-b border-gray-100 px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Stato del sistema
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Monitoraggio dei principali servizi della piattaforma.
        </p>
      </div>

      <div className="grid gap-5 p-8 sm:grid-cols-2 xl:grid-cols-4">

        {status.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${item.color}`}
              >
                <Icon size={26} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-gray-900">
                {item.title}
              </h3>

              <div className="mt-4 flex items-center gap-2">
                <CheckCircle2
                  size={18}
                  className="text-green-600"
                />

                <span className="font-medium text-gray-700">
                  {item.value}
                </span>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full w-full rounded-full bg-green-500" />
              </div>

            </div>
          );
        })}

      </div>

    </section>
  );
}