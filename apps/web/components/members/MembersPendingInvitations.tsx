"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";

type Role = "OWNER" | "ADMIN" | "MEMBER";

type Invitation = {
  id: string;
  email: string;
  role: Role;
  token: string;
  createdAt: string;
  expiresAt?: string;
  status?: string;
  acceptedAt?: string | null;
};

interface MembersPendingInvitationsProps {
  invitations: Invitation[];
  loading?: boolean;
  canManageMembers: boolean;
  onRemove: (id: string) => void | Promise<void>;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getInvitationStatus(invitation: Invitation) {
  const status = String(invitation.status ?? "PENDING")
    .trim()
    .toUpperCase();

  if (invitation.acceptedAt || status === "ACCEPTED") {
    return {
      label: "Accettato",
      className: "text-emerald-400",
      icon: CheckCircle2,
    };
  }

  if (
    invitation.expiresAt &&
    new Date(invitation.expiresAt).getTime() < Date.now()
  ) {
    return {
      label: "Scaduto",
      className: "text-amber-400",
      icon: Clock3,
    };
  }

  return {
    label: "In attesa",
    className: "text-blue-400",
    icon: Clock3,
  };
}

export default function MembersPendingInvitations({
  invitations,
  loading = false,
  canManageMembers,
  onRemove,
}: MembersPendingInvitationsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  async function copyInvitationLink(invitation: Invitation) {
    if (!invitation.token) {
      alert("Token dell'invito mancante.");
      return;
    }

    const invitationUrl =
      `${window.location.origin}/invite/accept?token=` +
      encodeURIComponent(invitation.token);

    try {
      await navigator.clipboard.writeText(invitationUrl);

      setCopiedId(invitation.id);

      window.setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch {
      alert("Impossibile copiare il link dell'invito.");
    }
  }

  async function handleRemove(id: string) {
    try {
      setRemovingId(id);
      await onRemove(id);
    } finally {
      setRemovingId(null);
    }
  }

  async function handleResend(invitation: Invitation) {
    try {
      setResendingId(invitation.id);

      const response = await fetch(
        `/api/invitations/${invitation.id}/resend`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Impossibile reinviare l'invito.",
        );
      }

      alert("Invito rinnovato. Copia il nuovo link per condividerlo.");
      window.location.reload();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Impossibile reinviare l'invito.",
      );
    } finally {
      setResendingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 text-gray-400">
        <Loader2 size={18} className="mr-2 animate-spin" />
        Caricamento inviti...
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-6 text-center text-gray-400">
        Nessun invito pendente.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Inviti in sospeso
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {invitations.length}{" "}
            {invitations.length === 1
              ? "invito presente"
              : "inviti presenti"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {invitations.map((invitation) => {
          const removing = removingId === invitation.id;
          const resending = resendingId === invitation.id;
          const status = getInvitationStatus(invitation);
          const StatusIcon = status.icon;

          return (
            <article
              key={invitation.id}
              className="rounded-xl border border-white/10 bg-[#0f172a] p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {invitation.email}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                    <span>
                      Ruolo:{" "}
                      <span className="font-medium text-gray-300">
                        {invitation.role}
                      </span>
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      Inviato: {formatDate(invitation.createdAt)}
                    </span>

                    {invitation.expiresAt && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={14} />
                        Scade: {formatDate(invitation.expiresAt)}
                      </span>
                    )}

                    <span
                      className={`inline-flex items-center gap-1.5 font-medium ${status.className}`}
                    >
                      <StatusIcon size={14} />
                      {status.label}
                    </span>
                  </div>
                </div>

                {canManageMembers && (
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        void handleResend(invitation)
                      }
                      disabled={resending || removing}
                      className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {resending ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <RefreshCw size={15} />
                      )}
                      {resending ? "Reinvio..." : "Reinvia"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void copyInvitationLink(invitation)
                      }
                      disabled={resending || removing}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Copy size={15} />
                      {copiedId === invitation.id
                        ? "Copiato!"
                        : "Copia link"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleRemove(invitation.id)
                      }
                      disabled={removing || resending}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {removing && (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      )}

                      <Trash2 size={15} />
                      {removing ? "Eliminazione..." : "Elimina"}
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}