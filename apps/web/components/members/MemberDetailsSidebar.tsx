"use client";

import Image from "next/image";
import { type ChangeEvent, useState } from "react";

import AuditLogSection from "./AuditLogSection";

type MemberRole = "OWNER" | "ADMIN" | "MEMBER" | string;
type MemberAction = "promote" | "demote" | "remove";

type MemberUser = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
};

type Member = {
  id: string;
  role: MemberRole;
  isActive: boolean;
  user?: MemberUser | null;
};

type AuditLog = {
  id: string;
  type: string;
  action: string;
  createdAt: string;
 details?: string | null;
};

type Note = {
  id: string;
  text: string;
  createdAt: string;
};

type MemberDocument = {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
  url: string;
};

type Permissions = {
  billing: boolean;
  adminPanel: boolean;
  analytics: boolean;
  contentEdit: boolean;
};

type PermissionKey = keyof Permissions;

type MemberDetailsSidebarProps = {
  member: Member | null;
  auditLogs: AuditLog[];
  onClose: () => void;
  onAction: (type: MemberAction, member: Member) => void;
  loadingId: string | null;
};

type MemberAvatarProps = {
  name: string;
  avatarUrl?: string | null;
};

const FILTERS = ["all", "role", "invitation", "login", "profile"] as const;
type LogFilter = (typeof FILTERS)[number];

function MemberAvatar({ name, avatarUrl }: MemberAvatarProps) {
  const initial = name.charAt(0).toUpperCase() || "?";

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={80}
        height={80}
        unoptimized
        className="h-20 w-20 rounded-full border border-slate-300 object-cover"
      />
    );
  }

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-2xl font-semibold text-slate-700">
      {initial}
    </div>
  );
}

function getRoleBadge(role: MemberRole) {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold";

  switch (role) {
    case "OWNER":
      return (
        <span className={`${base} border-purple-300 bg-purple-100 text-purple-700`}>
          OWNER
        </span>
      );
    case "ADMIN":
      return (
        <span className={`${base} border-blue-300 bg-blue-100 text-blue-700`}>
          ADMIN
        </span>
      );
    case "MEMBER":
      return (
        <span className={`${base} border-emerald-300 bg-emerald-100 text-emerald-700`}>
          MEMBER
        </span>
      );
    default:
      return (
        <span className={`${base} border-slate-300 bg-slate-100 text-slate-700`}>
          {role}
        </span>
      );
  }
}

function getStatusBadge(isActive: boolean) {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold";

  return isActive ? (
    <span className={`${base} border-emerald-300 bg-emerald-100 text-emerald-700`}>
      ATTIVO
    </span>
  ) : (
    <span className={`${base} border-red-300 bg-red-100 text-red-700`}>
      INATTIVO
    </span>
  );
}

function getDocumentIcon(type: string) {
  if (type.includes("pdf")) return "📕";
  if (type.includes("image")) return "🖼️";
  if (type.includes("word")) return "📘";
  if (type.includes("sheet")) return "📗";
  return "📄";
}

function escapeCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function getFilterLabel(filter: LogFilter) {
  switch (filter) {
    case "all":
      return "Tutto";
    case "role":
      return "Ruoli";
    case "invitation":
      return "Inviti";
    case "login":
      return "Login";
    case "profile":
      return "Profilo";
  }
}

export default function MemberDetailsSidebar({
  member,
  auditLogs,
  onClose,
  onAction,
  loadingId,
}: MemberDetailsSidebarProps) {
  const [filter, setFilter] = useState<LogFilter>("all");
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [permissions, setPermissions] = useState<Permissions>({
    billing: true,
    adminPanel: false,
    analytics: true,
    contentEdit: false,
  });
  const [documents, setDocuments] = useState<MemberDocument[]>([]);

  if (!member) {
    return null;
  }
  const memberId = member.id;
  const stats = {
    totalActions: auditLogs.length,
    roleChanges: auditLogs.filter((log) => log.type === "role").length,
    invitations: auditLogs.filter((log) => log.type === "invitation").length,
    logins: auditLogs.filter((log) => log.type === "login").length,
    profileUpdates: auditLogs.filter((log) => log.type === "profile").length,
    trend: [3, 5, 2, 8, 6, 9, 4],
  };

  const filteredLogs =
    filter === "all"
      ? auditLogs
      : auditLogs.filter((log) => log.type === filter);

  const name = member.user?.name ?? "—";
  const email = member.user?.email ?? "—";
  const phone = member.user?.phone ?? "—";
  const avatarUrl = member.user?.avatarUrl;

  const permissionKeys = Object.keys(permissions) as PermissionKey[];

  function addNote() {
    const text = newNote.trim();

    if (!text) {
      return;
    }

    const note: Note = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toISOString(),
    };

    setNotes((currentNotes) => [note, ...currentNotes]);
    setNewNote("");
  }

  function deleteNote(id: string) {
    setNotes((currentNotes) =>
      currentNotes.filter((note) => note.id !== id),
    );
  }

  function togglePermission(key: PermissionKey) {
    setPermissions((currentPermissions) => ({
      ...currentPermissions,
      [key]: !currentPermissions[key],
    }));
  }

  function uploadDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const newDocument: MemberDocument = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      createdAt: new Date().toISOString(),
      url: URL.createObjectURL(file),
    };

    setDocuments((currentDocuments) => [
      newDocument,
      ...currentDocuments,
    ]);

    event.target.value = "";
  }

  function deleteDocument(id: string) {
    setDocuments((currentDocuments) => {
      const documentToDelete = currentDocuments.find(
        (documentItem) => documentItem.id === id,
      );

      if (documentToDelete) {
        URL.revokeObjectURL(documentToDelete.url);
      }

      return currentDocuments.filter(
        (documentItem) => documentItem.id !== id,
      );
    });
  }

  function downloadCSV() {
    const header = "action,details,createdAt,type";

    const rows = auditLogs.map((log) =>
      [
        escapeCsvValue(log.action),
        escapeCsvValue(log.details ?? ""),
        escapeCsvValue(log.createdAt),
        escapeCsvValue(log.type),
      ].join(","),
    );

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `audit-log-${memberId}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Chiudi pannello dettagli membro"
        className="fixed inset-0 z-40 cursor-default bg-black/40 backdrop-blur-sm"
      />

      <aside className="fixed right-0 top-0 z-50 h-full w-[420px] max-w-full overflow-y-auto bg-white shadow-xl animate-[slideIn_0.3s_ease-out]">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Dettagli membro
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-300"
          >
            Chiudi
          </button>
        </div>

        <div className="space-y-8 p-6">
          <div className="flex flex-col items-center gap-3">
            <MemberAvatar name={name} avatarUrl={avatarUrl} />

            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900">{name}</p>
              <p className="text-sm text-slate-600">{email}</p>
              <p className="text-sm text-slate-500">{phone}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            {getRoleBadge(member.role)}
            {getStatusBadge(member.isActive)}
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => onAction("promote", member)}
              disabled={loadingId === member.id}
              className="w-full rounded-lg bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 disabled:opacity-50"
            >
              Promuovi
            </button>

            <button
              type="button"
              onClick={() => onAction("demote", member)}
              disabled={loadingId === member.id}
              className="w-full rounded-lg bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-200 disabled:opacity-50"
            >
              Retrocedi
            </button>

            <button
              type="button"
              onClick={() => onAction("remove", member)}
              disabled={loadingId === member.id}
              className="w-full rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
            >
              Rimuovi
            </button>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Permessi
            </h3>

            {permissionKeys.map((key) => (
              <div
                key={key}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm font-medium text-slate-700">
                  {key}
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={permissions[key]}
                  onClick={() => togglePermission(key)}
                  className={`relative h-6 w-12 rounded-full transition ${
                    permissions[key] ? "bg-indigo-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      permissions[key] ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Note interne
            </h3>

            <div className="flex gap-2">
              <input
                value={newNote}
                onChange={(event) => setNewNote(event.target.value)}
                placeholder="Aggiungi una nota..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />

              <button
                type="button"
                onClick={addNote}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Aggiungi
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <p className="text-sm text-slate-800">{note.text}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(note.createdAt).toLocaleString("it-IT")}
                  </p>

                  <button
                    type="button"
                    onClick={() => deleteNote(note.id)}
                    className="mt-2 text-xs text-red-600 hover:text-red-800"
                  >
                    Elimina
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Statistiche personali
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.totalActions}
                </p>
                <p className="text-xs text-slate-600">Azioni totali</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {stats.roleChanges}
                </p>
                <p className="text-xs text-slate-600">Cambi ruolo</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.invitations}
                </p>
                <p className="text-xs text-slate-600">Inviti</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.logins}
                </p>
                <p className="text-xs text-slate-600">Login</p>
              </div>

              <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {stats.profileUpdates}
                </p>
                <p className="text-xs text-slate-600">Modifiche profilo</p>
              </div>
            </div>

            <div className="mt-4 flex h-20 w-full items-end gap-2">
              {stats.trend.map((value, index) => (
                <div
                  key={`${value}-${index}`}
                  className="flex-1 rounded-md bg-indigo-300"
                  style={{ height: `${value * 10}px` }}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Documenti
            </h3>

            <input
              type="file"
              onChange={uploadDocument}
              className="mb-4 text-sm"
            />

            <div className="space-y-3">
              {documents.map((documentItem) => (
                <div
                  key={documentItem.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-xl">
                      {getDocumentIcon(documentItem.type)}
                    </span>

                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-slate-900">
                        {documentItem.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {(documentItem.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={documentItem.url}
                      download={documentItem.name}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Scarica
                    </a>

                    <button
                      type="button"
                      onClick={() => deleteDocument(documentItem.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Attività recente
              </h3>

              <button
                type="button"
                onClick={downloadCSV}
                className="rounded-lg bg-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-300"
              >
                Scarica CSV
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {FILTERS.map((currentFilter) => (
                <button
                  type="button"
                  key={currentFilter}
                  onClick={() => setFilter(currentFilter)}
                  className={`rounded-lg px-3 py-1 text-xs ${
                    filter === currentFilter
                      ? "bg-slate-900 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {getFilterLabel(currentFilter)}
                </button>
              ))}
            </div>

            <AuditLogSection logs={filteredLogs} />
          </div>
        </div>
      </aside>
    </>
  );
}