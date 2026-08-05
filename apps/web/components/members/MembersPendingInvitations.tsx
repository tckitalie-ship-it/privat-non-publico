"use client";

import { useState } from "react";
import { Loader2, Mail, Trash2 } from "lucide-react";

type Role = "OWNER" | "ADMIN" | "MEMBER";

interface Invitation {
  id: string;
  email: string;
  role: Role;
}

interface MembersPendingInvitationsProps {
  invitations: Invitation[];
  loading?: boolean;
  onRemove?: (id: string) => void | Promise<void>;
}

function RoleBadge({ role }: { role: Role }) {
  const common =
    "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold";

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

export default function MembersPendingInvitations({
  invitations,
  loading = false,
  onRemove,
}: MembersPendingInvitationsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const invitationToRemove = invitations.find(
    (invitation) => invitation.id === confirmRemoveId,
  );

  async function confirmRemoveInvitation() {
    if (!confirmRemoveId || !onRemove) {
      return;
    }

    try {
      setLoadingId(confirmRemoveId);
      await onRemove(confirmRemoveId);
      setConfirmRemoveId(null);
    } finally {
      setLoadingId(null);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#111827] p-5">
        <div className="flex min-h-24 items-center justify-center gap-3 text-sm text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          Caricamento inviti...
        </div>
      </section>
    );
  }

  if (invitations.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#111827] p-6 text-center">
        <Mail size={30} className="mx-auto text-gray-500" />

        <p className="mt-3 font-semibold text-white">
          Nessun invito in sospeso
        </p>

        <p className="mt-1 text-sm text-gray-400">
          Gli inviti inviati compariranno qui.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
              <Mail size={17} />
            </div>

            <div>
                <h3 className="text-sm font-semibold text-white">
  Inviti in sospeso
</h3>

              <p className="mt-0.5 text-xs text-gray-400">
                {invitations.length}{" "}
                {invitations.length === 1 ? "invito" : "inviti"}
              </p>
            </div>
          </div>
        </div>

        <ul className="divide-y divide-white/10">
          {invitations.map((invitation) => {
            const isLoading = loadingId === invitation.id;

            return (
              <li
                key={invitation.id}
                className="flex min-w-0 items-center gap-4 px-5 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {invitation.email}
                  </p>
                </div>

                <RoleBadge role={invitation.role} />

                {onRemove && (
                  <button
                    type="button"
                    onClick={() => setConfirmRemoveId(invitation.id)}
                    disabled={isLoading}
                    title="Elimina invito"
                    aria-label="Elimina invito"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-400/20 bg-red-500/10 text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {confirmRemoveId && invitationToRemove && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-invitation-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
            <h2
              id="remove-invitation-title"
              className="text-lg font-semibold text-white"
            >
              Eliminare l&apos;invito?
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Stai per eliminare l&apos;invito inviato a{" "}
              <span className="font-medium text-white">
                {invitationToRemove.email}
              </span>
              . Questa operazione non può essere annullata.
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
                onClick={() => void confirmRemoveInvitation()}
                disabled={loadingId === confirmRemoveId}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingId === confirmRemoveId && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Conferma eliminazione
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}