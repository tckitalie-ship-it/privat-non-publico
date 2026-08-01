"use client";

import React from "react";

interface RoleEvent {
  id: string;
  from: string;
  to: string;
  createdAt: string;
}

interface MemberRoleTimelineProps {
  events?: RoleEvent[] | null;
}

export default function MemberRoleTimeline({
  events = [],
}: MemberRoleTimelineProps) {
  const safeEvents = Array.isArray(events) ? events : [];

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">
        Cronologia Ruoli
      </h3>

      {safeEvents.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nessun cambio di ruolo registrato.
        </p>
      ) : (
        <div className="relative ml-3 border-l border-slate-300">
          {safeEvents.map((event) => (
            <div
              key={event.id}
              className="relative mb-6 ml-4 last:mb-0"
            >
              <div className="absolute -left-[22px] top-1 h-3 w-3 rounded-full border border-slate-400 bg-sky-500" />

              <div className="rounded-lg bg-slate-50 p-3 text-sm shadow-sm">
                <div className="font-medium text-slate-900">
                  Cambio ruolo
                </div>

                <div className="mt-1 text-xs text-slate-600">
                  {event.from} → {event.to}
                </div>

                <div className="mt-2 text-[11px] text-slate-500">
                  {event.createdAt
                    ? new Date(event.createdAt).toLocaleString("it-IT")
                    : "Data non disponibile"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}