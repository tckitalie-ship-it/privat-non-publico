"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, getAccessToken } from "@/lib/api";

type Association = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  subscriptionStatus?: string | null;
  subscriptionCurrentPeriodEnd?: string | null;
  _count: {
    memberships: number;
    events: number;
    files: number;
  };
};

export default function PlatformPage() {
  const router = useRouter();

  const [associations, setAssociations] = useState<Association[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function loadAssociations() {
    try {
      setError(null);

      const token = getAccessToken();

      if (!token) {
        throw new Error(
          "Sessione non disponibile. Effettua nuovamente il login.",
        );
      }

      const response = await fetch(
        `${API_URL}/platform/associations`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message ||
            `Errore caricamento associazioni (${response.status})`,
        );
      }

      const data = await response.json();

      setAssociations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Errore imprevisto",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssociations();
  }, []);

  async function handleCreateAssociation(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setCreateError(null);

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (trimmedName.length < 2) {
      setCreateError(
        "Il nome dell'associazione deve contenere almeno 2 caratteri.",
      );
      return;
    }

    try {
      setCreating(true);

      const token = getAccessToken();

      if (!token) {
        throw new Error(
          "Sessione non disponibile. Effettua nuovamente il login.",
        );
      }

      const response = await fetch(
        `${API_URL}/platform/associations`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: trimmedName,
            description: trimmedDescription,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        throw new Error(
          message ||
            `Errore creazione associazione (${response.status})`,
        );
      }

      setName("");
      setDescription("");
      setShowCreateForm(false);

      await loadAssociations();
    } catch (err) {
      setCreateError(
        err instanceof Error
          ? err.message
          : "Errore durante la creazione dell'associazione.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-slate-400">NPA</p>

            <h1 className="text-3xl font-bold">
              Platform Owner
            </h1>

            <p className="mt-2 text-slate-400">
              Gestione globale delle associazioni della piattaforma.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowCreateForm((current) => !current);
              setCreateError(null);
            }}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
          >
            {showCreateForm
              ? "Chiudi"
              : "+ Nuova associazione"}
          </button>
        </div>

        {/* CREATE FORM */}
        {showCreateForm && (
          <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Nuova associazione
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Il Platform Owner verrà aggiunto automaticamente
              come OWNER.
            </p>

            <form
              onSubmit={handleCreateAssociation}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="association-name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Nome associazione
                </label>

                <input
                  id="association-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Es. Sport & Cultura"
                  maxLength={120}
                  disabled={creating}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="association-description"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Descrizione
                </label>

                <textarea
                  id="association-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Descrizione dell'associazione..."
                  maxLength={500}
                  rows={4}
                  disabled={creating}
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              {createError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  {createError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateError(null);
                  }}
                  disabled={creating}
                  className="rounded-lg border border-slate-700 px-5 py-3 font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Annulla
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating
                    ? "Creazione..."
                    : "Crea associazione"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            Caricamento associazioni...
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        )}

        {/* TABLE */}
        {!loading && !error && (
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-800 bg-slate-950/60">
                  <tr>
                    <th className="px-5 py-4">
                      Associazione
                    </th>

                    <th className="px-5 py-4">
                      Stato
                    </th>

                    <th className="px-5 py-4">
                      Membri
                    </th>

                    <th className="px-5 py-4">
                      Eventi
                    </th>

                    <th className="px-5 py-4">
                      File
                    </th>

                    <th className="px-5 py-4">
                      Abbonamento
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {associations.map((association) => (
                    <tr
                      key={association.id}
                      onClick={() =>
                        router.push(
                          `/platform/associations/${association.id}`,
                        )
                      }
                      className="cursor-pointer border-b border-slate-800 transition hover:bg-slate-800/50 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-blue-400 transition hover:text-blue-300">
                          {association.name}
                        </div>

                        {association.description && (
                          <div className="mt-1 text-sm text-slate-400">
                            {association.description}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {association.isActive ? (
                          <span className="text-emerald-400">
                            Attiva
                          </span>
                        ) : (
                          <span className="text-red-400">
                            Disattiva
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {association._count.memberships}
                      </td>

                      <td className="px-5 py-4">
                        {association._count.events}
                      </td>

                      <td className="px-5 py-4">
                        {association._count.files}
                      </td>

                      <td className="px-5 py-4">
                        {association.subscriptionStatus ||
                          "Nessuno"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {associations.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                Nessuna associazione presente.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
