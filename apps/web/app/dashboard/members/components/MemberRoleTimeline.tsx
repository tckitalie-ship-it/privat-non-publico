"use client";

import React from "react";
import { motion } from "framer-motion";

interface RoleEvent {
  id: string;
  from: string;
  to: string;
  createdAt: string; // ISO date
}

interface MemberRoleTimelineProps {
  events: RoleEvent[];
}

const roleColors: Record<string, string> = {
  MEMBER: "#64748b",
  ADMIN: "#0ea5e9",
  OWNER: "#10b981",
};

export default function MemberRoleTimeline({ events }: MemberRoleTimelineProps) {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-50">
        Cronologia Ruoli
      </h3>

      <div className="relative ml-3 border-l border-slate-300 dark:border-slate-700">
        {events.map((ev, index) => {
          const color = roleColors[ev.to] ?? "#6366f1";

          return (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className="relative mb-6 ml-4"
            >
              {/* Punto */}
              <div
                className="absolute -left-[22px] top-1 h-3 w-3 rounded-full border border-slate-400 dark:border-slate-600"
                style={{ backgroundColor: color }}
              ></div>

              {/* Card */}
              <div className="rounded-lg bg-slate-50 p-3 text-sm shadow-sm dark:bg-slate-800">
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  Cambio ruolo
                </div>

                <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  <span
                    className="font-semibold"
                    style={{ color: roleColors[ev.from] ?? "#64748b" }}
                  >
                    {ev.from}
                  </span>{" "}
                  →{" "}
                  <span
                    className="font-semibold"
                    style={{ color: roleColors[ev.to] ?? "#6366f1" }}
                  >
                    {ev.to}
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  {new Date(ev.createdAt).toLocaleString("it-IT", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
