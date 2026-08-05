"use client";

import React from "react";

type AuditLog = {
  id: string;
  type: string;
  action: string;
  createdAt: string;
  details?: string | null;
};

export default function AuditLogSection({ logs }: { logs: AuditLog[] }) {
  if (!logs || logs.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Nessuna attività registrata per questo membro.
      </p>
    );
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getIcon(type: string) {
    switch (type) {
      case "role":
        return "🛡️";
      case "invitation":
        return "✉️";
      case "login":
        return "🔑";
      case "profile":
        return "📝";
      default:
        return "📄";
    }
  }

  const grouped = logs.reduce(
    (acc: Record<string, AuditLog[]>, log: AuditLog) => {
      const day = new Date(log.createdAt).toDateString();

      acc[day] = acc[day] || [];
      acc[day].push(log);

      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {Object.keys(grouped).map((day) => (
        <div key={day} className="space-y-3">
          <p className="text-xs font-semibold text-slate-700">{day}</p>

          <div className="space-y-3">
            {grouped[day].map((log) => (
              <div key={log.id} className="relative pl-6">
                {/* Linea verticale */}
                <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-300"></div>

                {/* Punto */}
                <div className="absolute left-0 top-2 h-3 w-3 rounded-full bg-indigo-500"></div>

                <div className="ml-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                      {getIcon(log.type)}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">
                        {log.action}
                      </span>

                      <span className="text-xs text-slate-600">
                        {formatDate(log.createdAt)}
                      </span>

                      {log.details && (
                        <span className="text-xs text-slate-500">
                          {log.details}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
