"use client";

import { Users, UserPlus } from "lucide-react";

interface MembersHeaderProps {
  membersCount: number;
  invitationsCount: number;
  canManageMembers: boolean;
  onInviteClick?: () => void;
}

export default function MembersHeader({
  onInviteClick,
  canManageMembers,
}: MembersHeaderProps) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111827] px-5 py-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
          <Users size={18} />
        </div>

        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-white">
            Membri
          </h1>

          <p className="mt-0.5 text-sm text-gray-400">
            Gestisci membri, ruoli e inviti dell&apos;associazione.
          </p>
        </div>
      </div>

      {canManageMembers && (
        <button
          type="button"
          onClick={onInviteClick}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          <UserPlus size={17} />
          Invita membro
        </button>
      )}
    </section>
  );
}