"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  API_URL,
  getAccessToken,
} from "@/lib/api";

type Role = "OWNER" | "ADMIN" | "MEMBER";

type JwtPayload = {
  sub?: string;
  id?: string;
  role?: Role;
  associationId?: string | null;
};

function getJwtPayload(): JwtPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = getAccessToken();

  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = decodeURIComponent(
      atob(payload)
        .split("")
        .map(
          (character) =>
            "%" +
            (
              "00" +
              character.charCodeAt(0).toString(16)
            ).slice(-2),
        )
        .join(""),
    );

    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function getCurrentUserRole(): Role | null {
  return getJwtPayload()?.role ?? null;
}

function getCurrentAssociationId(): string | null {
  const payload = getJwtPayload();

  return payload?.associationId ?? null;
}

export default function NewEventPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role | null>(null);
  const [associationId, setAssociationId] =
    useState<string | null>(null);
  const [checkingRole, setCheckingRole] =
    useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const payload = getJwtPayload();

    const currentRole = payload?.role ?? null;
    const currentAssociationId =
      payload?.associationId ?? null;

    setRole(currentRole);
    setAssociationId(currentAssociationId);
    setCheckingRole(false);

    if (
      currentRole !== "OWNER" &&
      currentRole !== "ADMIN"
    ) {
      toast.error(
        "Non hai i permessi per creare eventi.",
      );

      router.replace("/events");
      return;
    }

    if (!currentAssociationId) {
      toast.error(
        "Nessuna associazione attiva selezionata.",
      );

      router.replace("/events");
    }
  }, [router]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      role !== "OWNER" &&
      role !== "ADMIN"
    ) {
      toast.error(
        "Non hai i permessi per creare eventi.",
      );
      return;
    }

    const token = getAccessToken();

    if (!token) {
      toast.error(
        "Sessione non disponibile.",
      );
      return;
    }

    if (!associationId) {
      toast.error(
        "Nessuna associazione attiva selezionata.",
      );
      return;
    }

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      toast.error(
        "Inserisci il titolo dell'evento.",
      );
      return;
    }

    if (!startsAt) {
      toast.error(
        "Inserisci la data e l'ora di inizio.",
      );
      return;
    }

    const startsAtDate =
      new Date(startsAt);

    if (
      Number.isNaN(
        startsAtDate.getTime(),
      )
    ) {
      toast.error(
        "Data di inizio non valida.",
      );
      return;
    }

    let endsAtDate: Date | null = null;

    if (endsAt) {
      endsAtDate = new Date(endsAt);

      if (
        Number.isNaN(
          endsAtDate.getTime(),
        )
      ) {
        toast.error(
          "Data di fine non valida.",
        );
        return;
      }

      if (
        endsAtDate <= startsAtDate
      ) {
        toast.error(
          "La data di fine deve essere successiva alla data di inizio.",
        );
        return;
      }
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/events`,
        {
          method: "POST",
          headers: {
            Accept:
              "application/json",
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            associationId,
            title: cleanTitle,
            description:
              description.trim() || null,
            location:
              location.trim() || null,
            startsAt:
              startsAtDate.toISOString(),
            endsAt:
              endsAtDate?.toISOString() ??
              null,
          }),
        },
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ??
            `Errore creazione evento (${response.status})`,
        );
      }

      toast.success(
        "Evento creato correttamente.",
      );

      router.push("/events");
      router.refresh();
    } catch (error) {
      console.error(
        "Errore creazione evento:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Errore durante la creazione dell'evento.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingRole) {
    return (
      <main className="min-h-screen bg-slate-950 p-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#0f172a] p-8 text-center">
          <p className="text-sm text-gray-400">
            Verifica permessi...
          </p>
        </div>
      </main>
    );
  }

  if (
    role !== "OWNER" &&
    role !== "ADMIN"
  ) {
    return null;
  }

  if (!associationId) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              router.push("/events")
            }
            className="text-sm font-medium text-gray-400 transition hover:text-white"
          >
            ← Eventi
          </button>

          <h1 className="mt-4 text-3xl font-bold text-white">
            Nuovo evento
          </h1>

          <p className="mt-2 text-gray-400">
            Crea un evento per la tua
            associazione.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-xl"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Titolo *
            </label>

            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500"
              placeholder="Titolo dell'evento"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Descrizione
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500"
              placeholder="Descrizione dell'evento"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Luogo
            </label>

            <input
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500"
              placeholder="Es. Venezia"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Inizio *
              </label>

              <input
                type="datetime-local"
                value={startsAt}
                onChange={(event) =>
                  setStartsAt(
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Fine
              </label>

              <input
                type="datetime-local"
                value={endsAt}
                onChange={(event) =>
                  setEndsAt(
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                router.push("/events")
              }
              disabled={loading}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              Annulla
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creazione..."
                : "Crea evento"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}