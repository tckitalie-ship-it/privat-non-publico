"use client";

import {
  FormEvent,
  Suspense,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { setAccessToken } from "@/lib/api";
import { setActiveAssociationId } from "@/lib/association";

interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;
  activeAssociationId?: string | null;
  message?: string | string[];
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const inviteToken = searchParams.get("inviteToken");
  const inviteEmail = searchParams.get("inviteEmail");

  const [email, setEmail] = useState(inviteEmail ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data: LoginResponse | null = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Credenziali non valide";

        throw new Error(message);
      }

      const token =
        data?.accessToken ??
        data?.access_token ??
        data?.token;

      if (!token || typeof token !== "string") {
        throw new Error(
          "Il backend non ha restituito un token valido",
        );
      }

      setAccessToken(token);

      if (data?.activeAssociationId) {
        setActiveAssociationId(data.activeAssociationId);
      }

      const savedToken =
        localStorage.getItem("access_token");

      if (!savedToken) {
        throw new Error(
          "Il token non è stato salvato nel browser",
        );
      }

      /*
       * Se il login arriva da "Ho già un account"
       * nell'invito, accettiamo l'invito ora che
       * abbiamo un JWT valido.
       */
      if (inviteToken) {
  const acceptResponse = await fetch(
    "/api/invitations/accept",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        token: inviteToken,
      }),
    },
  );

  const acceptData = await acceptResponse
    .json()
    .catch(() => null);

  if (!acceptResponse.ok) {
    throw new Error(
      acceptData?.message ||
        "Login riuscito, ma impossibile accettare l'invito.",
    );
  }

  /*
   * L'invito ha appena creato la membership.
   * Il JWT precedente è stato emesso prima della membership
   * e quindi può non contenere associationId.
   *
   * Rifacciamo il login per ottenere un JWT aggiornato.
   */
  const refreshedLoginResponse = await fetch(
    "/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    },
  );

  const refreshedLoginData: LoginResponse | null =
    await refreshedLoginResponse
      .json()
      .catch(() => null);

  if (!refreshedLoginResponse.ok) {
    const refreshedMessage = Array.isArray(
      refreshedLoginData?.message,
    )
      ? refreshedLoginData.message.join(", ")
      : refreshedLoginData?.message ||
        "Membership creata, ma impossibile aggiornare la sessione.";

    throw new Error(refreshedMessage);
  }

  const refreshedToken =
    refreshedLoginData?.accessToken ??
    refreshedLoginData?.access_token ??
    refreshedLoginData?.token;

  if (
    !refreshedToken ||
    typeof refreshedToken !== "string"
  ) {
    throw new Error(
      "Il backend non ha restituito il nuovo token.",
    );
  }

  setAccessToken(refreshedToken);

  if (refreshedLoginData?.activeAssociationId) {
    setActiveAssociationId(
      refreshedLoginData.activeAssociationId,
    );
  }

  localStorage.setItem(
    "membershipUpdated",
    "true",
  );
}

      router.replace("/dashboard/associations");
      router.refresh();
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Errore durante il login",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1120] px-4 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl bg-[#111827] p-6 shadow-xl"
      >
        <h1 className="text-xl font-semibold">
          Accedi
        </h1>

        {inviteToken && (
          <p className="rounded-md bg-blue-600/20 p-3 text-sm text-blue-300">
            Dopo il login verrà accettato automaticamente
            l'invito all'associazione.
          </p>
        )}

        {error && (
          <p className="rounded-md bg-red-600/20 p-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          className="w-full rounded-md bg-[#1f2937] p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          disabled={loading}
          required
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          className="w-full rounded-md bg-[#1f2937] p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          disabled={loading}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 py-3 text-sm font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? inviteToken
              ? "Accesso e accettazione..."
              : "Accesso..."
            : "Accedi"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0b1120] text-white">
          Caricamento...
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}