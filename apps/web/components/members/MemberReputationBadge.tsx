"use client";

import React from "react";

interface Reputation {
  score: number;
  level: string;
  color: string;
}

export default function MemberReputationBadge({ reputation }: { reputation: Reputation }) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div
        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
        style={{ backgroundColor: reputation.color }}
      >
        {reputation.score}
      </div>

      <div>
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Reputazione: {reputation.level}
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300">
          Punteggio attività: {reputation.score}/100
        </div>
      </div>
    </div>
  );
}
