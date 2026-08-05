"use client";

import {
  Users,
  Crown,
  Shield,
  Mail,
} from "lucide-react";

interface MembersStatsProps {
  members: number;
  admins: number;
  owners: number;
  invitations: number;
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111827] px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gray-300">
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-400">
          {title}
        </p>

        <p className="text-lg font-semibold text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function MembersStats({
  members,
  admins,
  owners,
  invitations,
}: MembersStatsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Membri"
        value={members}
        icon={<Users size={17} />}
      />

      <StatCard
        title="Admin"
        value={admins}
        icon={<Shield size={17} />}
      />

      <StatCard
        title="Owner"
        value={owners}
        icon={<Crown size={17} />}
      />

      <StatCard
        title="Inviti"
        value={invitations}
        icon={<Mail size={17} />}
      />
    </section>
  );
}