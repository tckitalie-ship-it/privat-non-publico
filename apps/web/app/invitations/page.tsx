"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/ui";
import {
  API_URL,
  getAccessToken,
} from "@/lib/api";

type InvitationRole = "MEMBER" | "ADMIN";

interface JwtPayload {
  associationId?: string | null;
}

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
}

function readJwtPayload(token: string): JwtPayload | null {
  try {
    const encodedPayload = token.split(".")[1];

    if (!encodedPayload) {
      return null;
    }

    const normalized = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = normalized.padEnd(
      Math.ceil(normalized.length / 4) * 4,
      "=",
    );

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
    console.error("Errore lettura JWT:", error);
    return null;
  }
}

function getErrorMessage(
  data: ApiErrorResponse | null,
  status: number,
) {
  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  return data?.error || `Errore durante l’invio (${status})`;
}

export default function InvitationsPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [role, setRole] =
    useState<InvitationRole>("MEMBER");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Inserisci un indirizzo email");
      return;
    }

    const token = getAccessToken();

    if (!token) {
      setError(
        "Sessione non disponibile. Effettua nuovamente l’accesso.",
      );
      return;
    }

    const payload = readJwtPayload(token);
    const associationId = payload?.associationId;

    if (!associationId) {
      setError(
        "Nessuna associazione selezionata. Seleziona un’associazione e riprova.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/invitations`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            role,
            associationId,
          }),
        },
      );

      const data = (await response
        .json()
        .catch(() => null)) as ApiErrorResponse | null;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, response.status),
        );
      }

      setEmail("");
      setRole("MEMBER");
      setSuccess("Invito creato correttamente.");

      window.setTimeout(() => {
        router.push("/members");
        router.refresh();
      }, 1200);
    } catch (error) {
      console.error("Errore invio invito:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Impossibile inviare l’invito",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Invita un membro"
        description="Invia un invito via email per aggiungere un nuovo membro all’associazione."
      />

      <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-8">
        <form
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label
              htmlFor="invitation-email"
              className="mb-2 block text-sm text-gray-300"
            >
              Email
            </label>

            <input
              id="invitation-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="nome@email.it"
              autoComplete="email"
              required
              disabled={submitting}
              className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="invitation-role"
              className="mb-2 block text-sm text-gray-300"
            >
              Ruolo
            </label>

            <select
              id="invitation-role"
              name="role"
              value={role}
              onChange={(event) =>
                setRole(
                  event.target.value as InvitationRole,
                )
              }
              disabled={submitting}
              className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="MEMBER">Membro</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              {success}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Invio in corso..."
                : "Invia invito"}
            </button>

            <Link
              href="/members"
              aria-disabled={submitting}
              className={`rounded-xl bg-gray-700 px-6 py-3 font-semibold text-white transition hover:bg-gray-600 ${
                submitting
                  ? "pointer-events-none opacity-60"
                  : ""
              }`}
            >
              Annulla
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
