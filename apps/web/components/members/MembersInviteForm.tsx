"use client";

import { type FormEvent } from "react";
import { Mail, Send, Shield } from "lucide-react";

type Role = "OWNER" | "ADMIN" | "MEMBER";

interface MembersInviteFormProps {
  email: string;
  role: Role;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: Role) => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
}

export default function MembersInviteForm({
  email,
  role,
  loading,
  onEmailChange,
  onRoleChange,
  onSubmit,
}: MembersInviteFormProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Invita un nuovo membro
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Inserisci l&apos;email e assegna un ruolo.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end"
      >
        <div>
          <label
            htmlFor="member-email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email
          </label>

          <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
            <Mail
              size={18}
              className="shrink-0 text-slate-400"
            />

            <input
              id="member-email"
              type="email"
              value={email}
              onChange={(event) =>
                onEmailChange(event.target.value)
              }
              placeholder="nome@email.com"
              autoComplete="email"
              required
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="member-role"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Ruolo
          </label>

          <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
            <Shield
              size={18}
              className="shrink-0 text-slate-400"
            />

            <select
              id="member-role"
              value={role}
              onChange={(event) =>
                onRoleChange(event.target.value as Role)
              }
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-slate-900 outline-none"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
              <option value="OWNER">Owner</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={18} />
          {loading ? "Invio..." : "Invita"}
        </button>
      </form>
    </section>
  );
}