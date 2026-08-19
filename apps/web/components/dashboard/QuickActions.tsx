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

import { getAccessToken } from "@/lib/api";

type Role = "OWNER" | "ADMIN" | "MEMBER";

type JwtPayload = {
  role?: Role | string | null;
};

type Action = {
  title: string;
  description: string;
  href: string;
  icon: typeof UserPlus;
  color: string;
  roles: Role[];
};

function readJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalized = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded =
      normalized +
      "=".repeat((4 - (normalized.length % 4)) % 4);

    const decoded = decodeURIComponent(
      window
        .atob(padded)
        .split("")
        .map(
          (character) =>
            `%${character
              .charCodeAt(0)
              .toString(16)
              .padStart(2, "0")}`,
        )
        .join(""),
    );

    return JSON.parse(decoded) as JwtPayload;
  } catch (error) {
    console.error(
      "Errore lettura ruolo JWT:",
      error,
    );

    return null;
  }
}

const actions: Action[] = [
  {
    title: "Nuovo membro",
    description: "Gestisci i membri dell'associazione",
    href: "/members",
    icon: UserPlus,
    color: "bg-blue-500",
    roles: ["OWNER", "ADMIN"],
  },
  {
    title: "Nuovo evento",
    description: "Crea un nuovo evento",
    href: "/events/new",
    icon: CalendarPlus,
    color: "bg-purple-500",
    roles: ["OWNER", "ADMIN"],
  },
  {
    title: "Nuova transazione",
    description: "Gestisci entrate e uscite",
    href: "/dashboard/finance",
    icon: Wallet,
    color: "bg-green-500",
    roles: ["OWNER", "ADMIN"],
  },
  {
    title: "Gestisci documenti",
    description: "Visualizza e gestisci i file",
    href: "/dashboard/files",
    icon: FolderPlus,
    color: "bg-orange-500",
    roles: ["OWNER", "ADMIN"],
  },
  {
    title: "Invita membro",
    description: "Invia un invito all'associazione",
    href: "/members",
    icon: MailPlus,
    color: "bg-cyan-500",
    roles: ["OWNER", "ADMIN"],
  },
];

export default function QuickActions() {
  const token = getAccessToken();

  const payload = token
    ? readJwtPayload(token)
    : null;

  const role = payload?.role;

  const currentRole: Role | null =
    role === "OWNER" ||
    role === "ADMIN" ||
    role === "MEMBER"
      ? role
      : null;

  const visibleActions = currentRole
    ? actions.filter((action) =>
        action.roles.includes(currentRole),
      )
    : [];

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] shadow-xl">
      <div className="border-b border-white/10 px-8 py-6">
        <h2 className="text-2xl font-bold text-white">
          Azioni rapide
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Accedi velocemente alle operazioni
          disponibili per il tuo ruolo.
        </p>
      </div>

      <div className="grid gap-5 p-8 sm:grid-cols-2 xl:grid-cols-3">
        {visibleActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-[#1a1f2e] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:bg-[#202638] hover:shadow-xl"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow ${action.color}`}
                >
                  <Icon size={24} />
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-white transition-colors group-hover:text-indigo-400">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-400">
                    {action.description}
                  </p>
                </div>
              </div>

              <ChevronRight
                size={20}
                className="ml-3 shrink-0 text-gray-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-indigo-400"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}