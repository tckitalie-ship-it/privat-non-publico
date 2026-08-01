"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type Role = "OWNER" | "ADMIN" | "MEMBER";

type Invitation = {
  id: string;
  email: string;
  role: Role;
  token: string;
  createdAt: string;
};

interface MembersPendingInvitationsProps {
  invitations: Invitation[];
  loading?: boolean;
  onRemove: (id: string) => void | Promise<void>;
}

export default function MembersPendingInvitations({
  invitations,
  loading = false,
  onRemove,
}: MembersPendingInvitationsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function copyInvitationLink(invitation: Invitation) {
    if (!invitation.token) {
      alert("Token dell'invito mancante.");
      return;
    }

    const invitationUrl =
      `${window.location.origin}/invite/accept?token=` +
      encodeURIComponent(invitation.token);

    await navigator.clipboard.writeText(invitationUrl);

    setCopiedId(invitation.id);

    window.setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  }

  async function handleRemove(id: string) {
    try {
      setRemovingId(id);
      await onRemove(id);
    } finally {
      setRemovingId(null);
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
      <h2 className="text-lg font-semibold text-white">
        Inviti in sospeso
      </h2>

      {invitations.map((invitation) => {
        const removing = removingId === invitation.id;

        return (
          <article
            key={invitation.id}
            className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#0f172a] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-white">
                {invitation.email}
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Ruolo: {invitation.role}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Invito in attesa
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void copyInvitationLink(invitation)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                {copiedId === invitation.id
                  ? "Copiato!"
                  : "Copia link"}
              </button>

              <button
                type="button"
                onClick={() => void handleRemove(invitation.id)}
                disabled={removing}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
              >
                {removing && (
                  <Loader2 size={15} className="animate-spin" />
                )}

                Elimina
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}