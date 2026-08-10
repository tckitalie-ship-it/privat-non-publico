"use client";

import Link from "next/link";
import {
  CalendarPlus,
  UserPlus,
  Wallet,
  FolderPlus,
  MailPlus,
  ChevronRight,
} from "lucide-react";

const actions = [
  {
    title: "Nuovo membro",
    description: "Aggiungi un nuovo socio",
    href: "/members",
    icon: UserPlus,
    color: "bg-blue-500",
  },
  {
    title: "Nuovo evento",
    description: "Crea un evento",
    href: "/events/new",
    icon: CalendarPlus,
    color: "bg-purple-500",
  },
  {
    title: "Nuova transazione",
    description: "Registra un'entrata o uscita",
  href: "/dashboard/finance",
    icon: Wallet,
    color: "bg-green-500",
  },
  {
    title: "Carica documento",
    description: "Aggiungi un file",
    href: "/dashboard/files",
    icon: FolderPlus,
    color: "bg-orange-500",
  },
  {
    title: "Invia invito",
    description: "Invita un nuovo membro",
    href: "/members",
    icon: MailPlus,
    color: "bg-cyan-500",
  },
];

export default function QuickActions() {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white shadow-md">

      <div className="border-b border-gray-100 px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Azioni rapide
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Accedi velocemente alle operazioni più utilizzate.
        </p>
      </div>

      <div className="grid gap-5 p-8 sm:grid-cols-2 xl:grid-cols-3">

        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl"
            >
              <div className="flex items-center gap-4">

                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow ${action.color}`}
                >
                  <Icon size={24} />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>

              </div>

              <ChevronRight
                size={20}
                className="text-gray-400 transition-transform duration-300 group-hover:translate-x-1"
              />

            </Link>
          );
        })}

      </div>

    </section>
  );
}