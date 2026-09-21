"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/api";

type JwtPayload = {
  role?: string;
  associationId?: string | null;
};

type Plan = {
  name: string;
  description: string;
  priceId?: string;
};

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    return JSON.parse(
      decodeURIComponent(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      ),
    );
  } catch {
    return null;
  }
}

export default function BillingPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const plans = useMemo<Plan[]>(
    () => [
      {
        name: "Pro",
        description: "Piano Pro per la gestione avanzata dell'associazione.",
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
      },
      {
        name: "Enterprise",
        description: "Piano Enterprise per esigenze organizzative avanzate.",
        priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
      },
    ],
    [],
  );

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const payload = decodeJwt(token);

    if (!payload) {
      router.replace("/login");
      return;
    }

    if (payload.role !== "OWNER" && payload.role !== "ADMIN") {
      setChecking(false);
      return;
    }

    if (!payload.associationId) {
      setError("Nessuna associazione attiva.");
      setChecking(false);
      return;
    }

    setChecking(false);
  }, [router]);

  async function upgrade(priceId?: string) {
    if (!priceId) {
      setError("Prezzo Stripe non configurato.");
      return;
    }

    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const payload = decodeJwt(token);

    if (!payload?.associationId) {
      setError("Nessuna associazione attiva.");
      return;
    }

    setLoading(priceId);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"}/billing/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            associationId: payload.associationId,
            priceId,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Impossibile avviare il checkout Stripe.",
        );
      }

      if (!data?.url) {
        throw new Error("Stripe non ha restituito un URL di checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore durante l'avvio del checkout.",
      );
      setLoading(null);
    }
  }

  if (checking) {
    return (
      <main className="p-6">
        <p>Verifica autorizzazione...</p>
      </main>
    );
  }

  const token = getAccessToken();
  const payload = token ? decodeJwt(token) : null;
  const canManageBilling =
    payload?.role === "OWNER" || payload?.role === "ADMIN";

  if (!canManageBilling) {
    return (
      <main className="p-6">
        <div className="max-w-2xl rounded-xl border p-6">
          <h1 className="text-2xl font-semibold">
            Accesso non consentito
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Solo Owner e Admin possono gestire l'abbonamento
            dell'associazione.
          </p>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-4 rounded-lg border px-4 py-2"
          >
            Torna alla dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Abbonamento
          </h1>

          <p className="mt-2 text-muted-foreground">
            Gestisci il piano dell'associazione attiva.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-xl border p-6"
            >
              <h2 className="text-xl font-semibold">
                {plan.name}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <button
                type="button"
                disabled={!plan.priceId || loading !== null}
                onClick={() => upgrade(plan.priceId)}
                className="mt-6 rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === plan.priceId
                  ? "Apertura checkout..."
                  : `Scegli ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
