import RoleGuard from "@/components/role-guard";
import type { ReactNode } from "react";

export default function FinanceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard
      allowedRoles={["OWNER", "ADMIN"]}
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center p-6">
          <div className="max-w-lg rounded-3xl border border-white/10 bg-[#0f172a] p-8 text-center shadow-xl">
            <h1 className="text-2xl font-bold text-white">
              Accesso non consentito
            </h1>
            <p className="mt-3 text-gray-400">
              Solo Owner e Admin possono accedere alla gestione finanziaria.
            </p>
          </div>
        </main>
      }
    >
      {children}
    </RoleGuard>
  );
}
