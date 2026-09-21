"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/api";

export default function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload?.platformRole !== "PLATFORM_OWNER") {
        setAuthorized(false);
        setChecking(false);
        return;
      }

      setAuthorized(true);
      setChecking(false);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="rounded-xl border border-slate-800 bg-slate-900 px-6 py-5 text-slate-300">
          Verifica autorizzazione...
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="max-w-md rounded-xl border border-red-500/30 bg-slate-900 p-6 text-center">
          <h1 className="text-xl font-semibold text-red-300">
            Accesso non consentito
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Questa sezione è riservata al Platform Owner.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/dashboard")}
            className="mt-5 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
          >
            Torna alla dashboard
          </button>
        </div>
      </main>
    );
  }

  return children;
}
