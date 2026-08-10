"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { setAccessToken } from "@/lib/api";

interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;
  message?: string | string[];
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
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

      if (!localStorage.getItem("access_token")) {
        throw new Error(
          "Il token non è stato salvato nel browser",
        );
      }

      router.replace("/dashboard");
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
        <h1 className="text-xl font-semibold">Accedi</h1>

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
          onChange={(event) => setEmail(event.target.value)}
          disabled={loading}
          required
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          className="w-full rounded-md bg-[#1f2937] p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={loading}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 py-3 text-sm font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Accesso..." : "Accedi"}
        </button>
      </form>
    </div>
  );
}
