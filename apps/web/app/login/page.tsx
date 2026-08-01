"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAccessToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Credenziali non valide");
      }

      const data = await res.json();
      const token = data.accessToken;

      // 🔵 SALVATAGGIO TOKEN
      setAccessToken(token);

      // 🔵 TEST RICHIESTO
      alert(
        localStorage.getItem("access_token")
          ? "Token salvato correttamente"
          : "Token NON salvato",
      );

      // 🔵 REDIRECT
      router.replace("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore durante il login",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1120] text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl bg-[#111827] p-6 shadow-xl"
      >
        <h1 className="text-xl font-semibold">Accedi</h1>

        {error && (
          <p className="rounded-md bg-red-600/20 p-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-md bg-[#1f2937] p-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-md bg-[#1f2937] p-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Accesso..." : "Login"}
        </button>
      </form>
    </div>
  );
}
