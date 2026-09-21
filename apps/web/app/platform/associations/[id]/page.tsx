"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_URL, getAccessToken } from "@/lib/api";

type Association = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  slug: string | null;
  logoUrl: string | null;
  subscriptionStatus: string | null;
  subscriptionCurrentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    memberships: number;
    events: number;
    files: number;
    reminders: number;
    notifications: number;
    transactions: number;
  };
};

type Member = {
  id: string;
  userId: string;
  memberNumber: number | null;
  firstName: string;
  lastName: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;
  user: {
    email: string;
  };
};

export default function PlatformAssociationDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [association, setAssociation] =
    useState<Association | null>(null);

  const [members, setMembers] = useState<Member[]>([]);

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);

  const [error, setError] = useState("");
  const [membersError, setMembersError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [editError, setEditError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  function formatSubscriptionDate(value: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleString("it-IT");
  }

  async function loadAssociation() {
    try {
      setError("");

      const token = getAccessToken();

      if (!token) {
        throw new Error(
          "Sessione non disponibile. Effettua nuovamente il login.",
        );
      }

      const response = await fetch(
        `${API_URL}/platform/associations/${id}`,
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
            `Errore caricamento associazione (${response.status})`,
        );
      }

      const data = await response.json();

      setAssociation(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore caricamento associazione",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMembers() {
    try {
      setMembersError("");

      const token = getAccessToken();

      if (!token) {
        throw new Error(
          "Sessione non disponibile. Effettua nuovamente il login.",
        );
      }

      const response = await fetch(
        `${API_URL}/platform/associations/${id}/members`,
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
            `Errore caricamento membri (${response.status})`,
        );
      }

      const data = await response.json();

      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setMembersError(
        err instanceof Error
          ? err.message
          : "Errore caricamento membri",
      );
    } finally {
      setMembersLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadAssociation();
      loadMembers();
    }
  }, [id]);

  function startEditing() {
    if (!association) return;

    setName(association.name);
    setDescription(association.description ?? "");
    setSlug(association.slug ?? "");
    setLogoUrl(association.logoUrl ?? "");

    setEditError("");
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setEditError("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setEditError("");

    if (name.trim().length < 2) {
      setEditError(
        "Il nome dell'associazione deve contenere almeno 2 caratteri.",
      );
      return;
    }

    try {
      setSaving(true);

      const token = getAccessToken();

      if (!token) {
        throw new Error(
          "Sessione non disponibile. Effettua nuovamente il login.",
        );
      }

      const response = await fetch(
        `${API_URL}/platform/associations/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            slug: slug.trim(),
            logoUrl: logoUrl.trim(),
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
            `Errore salvataggio associazione (${response.status})`,
        );
      }

      setAssociation((current) =>
        current
          ? {
              ...current,
              ...data,
            }
          : data,
      );

      window.alert("✅ Modifiche salvate correttamente.");

      setTimeout(() => {
        setEditing(false);
          }, 5000);
    } catch (err) {
      setEditError(
        err instanceof Error
          ? err.message
          : "Errore durante il salvataggio.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange() {
    if (!association) return;

    const nextStatus = !association.isActive;
    const action = nextStatus ? "attivare" : "disattivare";

    if (!window.confirm(`Vuoi davvero ${action} questa associazione?`)) {
      return;
    }

    try {
      setStatusSaving(true);
      setStatusError("");

      const token = getAccessToken();

      if (!token) {
        throw new Error(
          "Sessione non disponibile. Effettua nuovamente il login.",
        );
      }

      const response = await fetch(
        `${API_URL}/platform/associations/${id}/status`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: nextStatus,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Errore modifica stato associazione (${response.status})`,
        );
      }

      setAssociation((current) =>
        current
          ? {
              ...current,
              isActive: data.isActive,
              updatedAt: data.updatedAt,
            }
          : current,
      );
    } catch (err) {
      setStatusError(
        err instanceof Error
          ? err.message
          : "Errore durante la modifica dello stato.",
      );
    } finally {
      setStatusSaving(false);
    }
  }
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-6xl">
          Caricamento associazione...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() => router.push("/platform")}
            className="mb-8 rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
          >
            ← Torna alle associazioni
          </button>

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!association) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        Associazione non trovata.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        {/* NAVIGAZIONE */}
        <button
          onClick={() => router.push("/platform")}
          className="mb-8 rounded-lg border border-slate-700 px-4 py-2 text-slate-300 transition hover:bg-slate-800"
        >
          ← Torna alle associazioni
        </button>

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-slate-400">
              Platform Owner
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              {association.name}
            </h1>

            {association.description && (
              <p className="mt-2 text-slate-400">
                {association.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleStatusChange}
              disabled={statusSaving}
              className={
                association.isActive
                  ? "rounded-lg border border-red-500/40 bg-red-500/10 px-5 py-3 font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                  : "rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
              }
            >
              {statusSaving
                ? "Salvataggio..."
                : association.isActive
                  ? "Disattiva associazione"
                  : "Riattiva associazione"}
            </button>

            <button
              type="button"
              onClick={startEditing}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
            >
              Modifica associazione
            </button>
          </div>
        </div>

        {/* FORM MODIFICA */}
        {editing && (
          <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Modifica associazione
            </h2>

            <form
              onSubmit={handleSave}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="association-name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Nome
                </label>

                <input
                  id="association-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  maxLength={120}
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
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
                  maxLength={500}
                  rows={4}
                  disabled={saving}
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="association-slug"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Slug
                </label>

                <input
                  id="association-slug"
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    setSlug(event.target.value)
                  }
                  maxLength={120}
                  disabled={saving}
                  placeholder="es. sport-cultura"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="association-logo"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Logo URL
                </label>

                <input
                  id="association-logo"
                  type="url"
                  value={logoUrl}
                  onChange={(event) =>
                    setLogoUrl(event.target.value)
                  }
                  maxLength={500}
                  disabled={saving}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              {editError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  {editError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="rounded-lg border border-slate-700 px-5 py-3 font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Annulla
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  {saving
                    ? "Salvataggio..."
                    : "Salva modifiche"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STATISTICHE */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Stato</p>

            <p className="mt-2 text-xl font-semibold">
              {association.isActive ? (
                <span className="text-emerald-400">
                  Attiva
                </span>
              ) : (
                <span className="text-red-400">
                  Disattiva
                </span>
              )}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Membri</p>

            <p className="mt-2 text-3xl font-bold">
              {association._count.memberships}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Eventi</p>

            <p className="mt-2 text-3xl font-bold">
              {association._count.events}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">File</p>

            <p className="mt-2 text-3xl font-bold">
              {association._count.files}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Reminder</p>

            <p className="mt-2 text-3xl font-bold">
              {association._count.reminders}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Notifiche</p>

            <p className="mt-2 text-3xl font-bold">
              {association._count.notifications}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Transazioni</p>

            <p className="mt-2 text-3xl font-bold">
              {association._count.transactions}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Abbonamento
            </p>

            <p className="mt-2 text-xl font-semibold">
              {association.subscriptionStatus || "Nessuno"}
            </p>

            {association.subscriptionCurrentPeriodEnd && (
              <p className="mt-2 text-sm text-slate-400">
                Fine periodo:{" "}
                {formatSubscriptionDate(
                  association.subscriptionCurrentPeriodEnd,
                )}
              </p>
            )}

            {association.stripeCustomerId && (
              <p className="mt-2 break-all font-mono text-xs text-slate-500">
                Customer: {association.stripeCustomerId}
              </p>
            )}
          </div>
        </div>

        {/* MEMBRI */}
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-6">
            <h2 className="text-xl font-semibold">
              Membri
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {members.length} membri presenti nell'associazione
            </p>
          </div>

          {membersLoading && (
            <div className="p-6 text-slate-400">
              Caricamento membri...
            </div>
          )}

          {membersError && (
            <div className="p-6 text-red-300">
              {membersError}
            </div>
          )}

          {!membersLoading &&
            !membersError &&
            members.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-800 bg-slate-950/60">
                    <tr>
                      <th className="px-5 py-4">
                        N. membro
                      </th>
                      <th className="px-5 py-4">
                        Nome
                      </th>
                      <th className="px-5 py-4">
                        Email
                      </th>
                      <th className="px-5 py-4">
                        Ruolo
                      </th>
                      <th className="px-5 py-4">
                        Iscritto
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {members.map((member) => (
                      <tr
                        key={member.id}
                        onClick={() =>
                          router.push(
                            `/platform/associations/${id}/members/${member.id}`,
                          )
                        }
                        className="cursor-pointer border-b border-slate-800 transition hover:bg-slate-800/50 last:border-0"
                      >
                        <td className="px-5 py-4">
                          {member.memberNumber ?? "—"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium">
                            {member.firstName}{" "}
                            {member.lastName}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-300">
                          {member.user.email}
                        </td>

                        <td className="px-5 py-4">
                          {member.role === "OWNER" && (
                            <span className="font-semibold text-amber-400">
                              OWNER
                            </span>
                          )}

                          {member.role === "ADMIN" && (
                            <span className="font-semibold text-blue-400">
                              ADMIN
                            </span>
                          )}

                          {member.role === "MEMBER" && (
                            <span className="text-slate-300">
                              MEMBER
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {new Date(
                            member.createdAt,
                          ).toLocaleDateString("it-IT")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          {!membersLoading &&
            !membersError &&
            members.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                Nessun membro presente.
              </div>
            )}
        </div>

        {/* INFORMAZIONI */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Informazioni associazione
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-400">ID</p>
              <p className="mt-1 break-all font-mono text-sm text-blue-400">
                {association.id}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Slug</p>
              <p className="mt-1">
                {association.slug || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Stripe Customer
              </p>
              <p className="mt-1 break-all font-mono text-sm">
                {association.stripeCustomerId || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Stripe Subscription
              </p>
              <p className="mt-1 break-all font-mono text-sm">
                {association.stripeSubscriptionId || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Creata</p>
              <p className="mt-1">
                {new Date(
                  association.createdAt,
                ).toLocaleString("it-IT")}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Ultimo aggiornamento
              </p>
              <p className="mt-1">
                {new Date(
                  association.updatedAt,
                ).toLocaleString("it-IT")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}







