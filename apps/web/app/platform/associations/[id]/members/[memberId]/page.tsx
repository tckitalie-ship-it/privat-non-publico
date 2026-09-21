"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_URL, getAccessToken } from "@/lib/api";

type Member = {
  id: string;
  userId: string;
  memberNumber: number | null;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  address: string | null;
  phone: string | null;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
  };
};

export default function PlatformMemberDetailPage() {
  const params = useParams();
  const router = useRouter();

  const associationId = params.id as string;
  const memberId = params.memberId as string;

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [memberNumber, setMemberNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Member["role"]>("MEMBER");

  async function loadMember() {
    try {
      setLoading(true);
      setError("");

      const token = getAccessToken();

      if (!token) {
        throw new Error("Sessione non disponibile.");
      }

      const response = await fetch(
        `${API_URL}/platform/associations/${associationId}/members/${memberId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Errore caricamento membro (${response.status})`,
        );
      }

      setMember(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore caricamento membro",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (associationId && memberId) {
      loadMember();
    }
  }, [associationId, memberId]);

  function startEditing() {
    if (!member) return;

    setFirstName(member.firstName ?? "");
    setLastName(member.lastName ?? "");
    setMemberNumber(
      member.memberNumber !== null
        ? String(member.memberNumber)
        : "",
    );
    setBirthDate(
      member.birthDate
        ? new Date(member.birthDate)
            .toISOString()
            .slice(0, 10)
        : "",
    );
    setAddress(member.address ?? "");
    setPhone(member.phone ?? "");
    setRole(member.role);

    setEditError("");
    setEditing(true);
  }

  function cancelEditing() {
    if (saving) return;
    setEditing(false);
    setEditError("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setEditError("");

    if (!firstName.trim()) {
      setEditError("Il nome è obbligatorio.");
      return;
    }

    if (!lastName.trim()) {
      setEditError("Il cognome è obbligatorio.");
      return;
    }

    let parsedMemberNumber: number | null = null;

    if (memberNumber.trim() !== "") {
      const value = Number(memberNumber);

      if (!Number.isInteger(value) || value < 1) {
        setEditError(
          "Il numero membro deve essere un intero positivo.",
        );
        return;
      }

      parsedMemberNumber = value;
    }

    try {
      setSaving(true);

      const token = getAccessToken();

      if (!token) {
        throw new Error("Sessione non disponibile.");
      }

      const response = await fetch(
        `${API_URL}/platform/associations/${associationId}/members/${memberId}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            memberNumber: parsedMemberNumber,
            birthDate: birthDate || null,
            address: address.trim(),
            phone: phone.trim(),
            role,
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
            `Errore salvataggio membro (${response.status})`,
        );
      }

      setMember(data);
      setEditing(false);

      window.alert("✅ Membro aggiornato correttamente.");
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

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-4xl">
          Caricamento membro...
        </div>
      </main>
    );
  }

  if (error || !member) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() =>
              router.push(
                `/platform/associations/${associationId}`,
              )
            }
            className="mb-8 rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
          >
            ← Torna all'associazione
          </button>

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            {error || "Membro non trovato."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() =>
            router.push(
              `/platform/associations/${associationId}`,
            )
          }
          className="mb-8 rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
        >
          ← Torna all'associazione
        </button>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-slate-400">
              Platform Owner
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              {member.firstName} {member.lastName}
            </h1>
          </div>

          <button
            type="button"
            onClick={startEditing}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
          >
            ✏️ Modifica membro
          </button>
        </div>

        {editing && (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Modifica membro
            </h2>

            <form
              onSubmit={handleSave}
              className="mt-6 space-y-5"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="member-first-name"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Nome
                  </label>
                  <input
                    id="member-first-name"
                    type="text"
                    value={firstName}
                    onChange={(event) =>
                      setFirstName(event.target.value)
                    }
                    maxLength={100}
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="member-last-name"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Cognome
                  </label>
                  <input
                    id="member-last-name"
                    type="text"
                    value={lastName}
                    onChange={(event) =>
                      setLastName(event.target.value)
                    }
                    maxLength={100}
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="member-number"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Numero membro
                  </label>
                  <input
                    id="member-number"
                    type="number"
                    min={1}
                    step={1}
                    value={memberNumber}
                    onChange={(event) =>
                      setMemberNumber(event.target.value)
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="member-role"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Ruolo
                  </label>
                  <select
                    id="member-role"
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value as Member["role"])
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="OWNER">OWNER</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="member-birth-date"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Data di nascita
                  </label>
                  <input
                    id="member-birth-date"
                    type="date"
                    value={birthDate}
                    onChange={(event) =>
                      setBirthDate(event.target.value)
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="member-phone"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Telefono
                  </label>
                  <input
                    id="member-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    maxLength={50}
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="member-address"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Indirizzo
                </label>
                <input
                  id="member-address"
                  type="text"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  maxLength={255}
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email
                </label>
                <div className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-slate-400">
                  {member.user.email}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  L'email appartiene all'account utente e non viene
                  modificata da questa schermata.
                </p>
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
                  {saving ? "Salvataggio..." : "Salva modifiche"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Informazioni membro
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-400">Nome</p>
              <p className="mt-1">{member.firstName || "—"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Cognome</p>
              <p className="mt-1">{member.lastName || "—"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="mt-1 text-blue-400">
                {member.user.email || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Numero membro
              </p>
              <p className="mt-1">
                {member.memberNumber ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Ruolo</p>
              <p className="mt-1 font-semibold">
                {member.role}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Data di nascita
              </p>
              <p className="mt-1">
                {member.birthDate
                  ? new Date(member.birthDate).toLocaleDateString(
                      "it-IT",
                    )
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Telefono</p>
              <p className="mt-1">{member.phone || "—"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Indirizzo</p>
              <p className="mt-1">{member.address || "—"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Iscritto</p>
              <p className="mt-1">
                {new Date(member.createdAt).toLocaleDateString(
                  "it-IT",
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Ultimo aggiornamento
              </p>
              <p className="mt-1">
                {new Date(member.updatedAt).toLocaleString(
                  "it-IT",
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
