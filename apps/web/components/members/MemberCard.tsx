"use client";

import { Crown, Mail, Shield, Trash2, User } from "lucide-react";

interface Member {
  id: string;
  role?: string;
  createdAt: string;
  user?: {
    email?: string;
  };
}

interface MemberCardProps {
  member: Member;
  onRemove?: (id: string) => void;
}

export default function MemberCard({
  member,
  onRemove,
}: MemberCardProps) {
  const email = member?.user?.email ?? "N/A";

  const initials = email.substring(0, 2).toUpperCase();

  const role = member?.role ?? "MEMBER";

  const roleConfig = {
    OWNER: {
      icon: <Crown size={16} />,
      badge: "bg-amber-500/15 text-amber-300 border-amber-500/20",
    },
    ADMIN: {
      icon: <Shield size={16} />,
      badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    },
    MEMBER: {
      icon: <User size={16} />,
      badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/20",
    },
  };

  const current =
    roleConfig[role as keyof typeof roleConfig] ??
    roleConfig.MEMBER;

  return (
    <div className="group rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-2xl">
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 text-lg font-bold text-white shadow-lg">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-white">
                {email}
              </h3>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                <Mail size={14} />
                <span className="truncate">{email}</span>
              </div>
            </div>

            <span
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${current.badge}`}
            >
              {current.icon}
              {role}
            </span>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Creato il{" "}
              {new Date(member.createdAt).toLocaleDateString("it-IT")}
            </span>

            {role !== "OWNER" && onRemove && (
              <button
                onClick={() => onRemove(member.id)}
                className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500 hover:text-white"
              >
                <Trash2 size={16} />
                Rimuovi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
