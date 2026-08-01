"use client";
import Image from "next/image";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { API_URL, getAccessToken } from "@/lib/api";

type Role = "OWNER" | "ADMIN" | "MEMBER";

type Member = {
  id: string;
  role: Role;
  memberNumber?: number | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
  };
};

interface MembersListProps {
  members: Member[];
  loading?: boolean;
  onRemove: (id: string) => void | Promise<void>;
  onSelectMember?: (member: Member) => void;
}

function getDisplayName(member: Member) {
  return member.user?.name?.trim() || member.user?.email || "Membro";
}

function getCurrentUserId(): string | null {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return null;
    }

    const normalized = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );

    const payload = JSON.parse(atob(padded));

    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

function RoleBadge({ role }: { role: Role }) {
  const common =
    "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold";

  if (role === "OWNER") {
    return (
      <span
        className={`${common} border-purple-400/30 bg-purple-500/10 text-purple-300`}
      >
        Owner
      </span>
    );
  }

  if (role === "ADMIN") {
    return (
      <span
        className={`${common} border-blue-400/30 bg-blue-500/10 text-blue-300`}
      >
        Admin
      </span>
    );
  }

  return (
    <span
      className={`${common} border-emerald-400/30 bg-emerald-500/10 text-emerald-300`}
    >
      Membro
    </span>
  );
}

export default function MembersList({
  members,
  loading = false,
  onRemove,
  onSelectMember,
}: MembersListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const currentUserId = getCurrentUserId();

  const ownersCount = members.filter(
    (member) => member.role === "OWNER",
  ).length;

  async function updateRole(member: Member, newRole: Role) {
    if (member.role === newRole) {
      return;
    }

    const token = getAccessToken();

    if (!token) {
      toast.error("Sessione non disponibile");
      return;
    }

    try {
      setLoadingId(member.id);

      const response = await fetch(
        `${API_URL}/memberships/${member.id}/role`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        throw new Error(
          message || `Errore aggiornamento ruolo (${response.status})`,
        );
      }

      toast.success(`Ruolo aggiornato: ${newRole}`);
      window.location.reload();
    } catch (error) {
      console.error("Errore aggiornamento ruolo:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile aggiornare il ruolo",
      );
    } finally {
      setLoadingId(null);
    }
  }

  async function promoteMember(member: Member) {
    if (member.role === "MEMBER") {
      await updateRole(member, "ADMIN");
      return;
    }

    if (member.role === "ADMIN") {
      await updateRole(member, "OWNER");
      return;
    }

    toast.info("Il membro è già Owner");
  }

  async function demoteMember(member: Member) {
    const isOnlyOwner = member.role === "OWNER" && ownersCount === 1;

    if (isOnlyOwner) {
      toast.error("Non puoi retrocedere l’unico Owner dell’associazione");
      return;
    }

    if (member.role === "OWNER") {
      await updateRole(member, "ADMIN");
      return;
    }

    if (member.role === "ADMIN") {
      await updateRole(member, "MEMBER");
      return;
    }

    toast.info("Il membro ha già il ruolo più basso");
  }

  async function confirmRemove() {
    if (!confirmRemoveId) {
      return;
    }

    const member = members.find((item) => item.id === confirmRemoveId);

    if (!member) {
      toast.error("Membro non trovato");
      setConfirmRemoveId(null);
      return;
    }

    const isCurrentUser = member.user.id === currentUserId;
    const isOnlyOwner = member.role === "OWNER" && ownersCount === 1;

    if (isCurrentUser) {
      toast.error("Non puoi rimuovere la tua membership");
      setConfirmRemoveId(null);
      return;
    }

    if (isOnlyOwner) {
      toast.error("Non puoi rimuovere l’unico Owner dell’associazione");
      setConfirmRemoveId(null);
      return;
    }

    try {
      setLoadingId(confirmRemoveId);
      await onRemove(confirmRemoveId);
      setConfirmRemoveId(null);
    } catch (error) {
      console.error("Errore rimozione membro:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile rimuovere il membro",
      );
    } finally {
      setLoadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-2xl border border-white/10 bg-[#0f172a]">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          Caricamento membri...
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-8 text-center">
        <UserRound size={36} className="mx-auto text-gray-500" />

        <p className="mt-4 font-semibold text-white">
          Nessun membro trovato
        </p>

        <p className="mt-2 text-sm text-gray-400">
          Modifica i filtri oppure invita un nuovo membro.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1.5">
        {members.map((member) => {
          const name = getDisplayName(member);
          const email = member.user?.email ?? "Email non disponibile";
          const initial = (name || email)
            .replace("@", " ")
            .trim()
            .substring(0, 2)
            .toUpperCase();

          const isLoading = loadingId === member.id;
          const isCurrentUser = member.user.id === currentUserId;
          const isOnlyOwner = member.role === "OWNER" && ownersCount === 1;

          const cannotPromote = member.role === "OWNER";
          const cannotDemote = member.role === "MEMBER" || isOnlyOwner;
          const cannotRemove = isCurrentUser || isOnlyOwner;

          return (
            <article
              key={member.id}
              onClick={() => onSelectMember?.(member)}
              className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 shadow-sm transition hover:border-white/20"
            >
              {member.user?.avatarUrl ? (
                <Image
  src={member.user.avatarUrl}
  alt={name}
  width={40}
  height={40}
  className="h-10 w-10 shrink-0 rounded-full border border-white/10 object-cover"
/>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 text-sm font-bold text-blue-300">
                  {initial}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                    {name}
                  </p>

                  <RoleBadge role={member.role} />
                </div>

                {name !== email && (
                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {email}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void promoteMember(member);
                  }}
                  disabled={isLoading || cannotPromote}
                  title={
                    cannotPromote
                      ? "Il membro è già Owner"
                      : "Promuovi il membro"
                  }
                  aria-label="Promuovi il membro"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-400/20 bg-indigo-500/10 text-indigo-300 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <ChevronUp size={15} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void demoteMember(member);
                  }}
                  disabled={isLoading || cannotDemote}
                  title={
                    isOnlyOwner
                      ? "L’unico Owner non può essere retrocesso"
                      : member.role === "MEMBER"
                        ? "Il membro ha già il ruolo più basso"
                        : "Retrocedi il membro"
                  }
                  aria-label="Retrocedi il membro"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-500/10 text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <ChevronDown size={15} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();

                    if (isCurrentUser) {
                      toast.error("Non puoi rimuovere la tua membership");
                      return;
                    }

                    if (isOnlyOwner) {
                      toast.error(
                        "Non puoi rimuovere l’unico Owner dell’associazione",
                      );
                      return;
                    }
                    console.log("Trash clicked", member.id);
                    setConfirmRemoveId(member.id);
                  }}
                  disabled={isLoading || cannotRemove}
                  title={
                    isCurrentUser
                      ? "Non puoi rimuovere il tuo account"
                      : isOnlyOwner
                        ? "L’unico Owner non può essere rimosso"
                        : "Rimuovi il membro"
                  }
                  aria-label="Rimuovi il membro"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/20 bg-red-500/10 text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {confirmRemoveId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">
              Rimuovere il membro?
            </h3>

            <p className="mt-2 text-sm text-gray-400">
              Il membro perderà l&apos;accesso all&apos;associazione.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmRemoveId(null)}
                disabled={loadingId === confirmRemoveId}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
              >
                Annulla
              </button>

              <button
                type="button"
                onClick={() => void confirmRemove()}
                disabled={loadingId === confirmRemoveId}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingId === confirmRemoveId && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Conferma rimozione
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}