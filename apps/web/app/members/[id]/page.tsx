"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, MapPin, Pencil, Printer, Save, Users, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getAccessToken } from "@/lib/api";
import { getActiveAssociationId } from "@/lib/association";

type MemberHistory = {
  member: {
    id: string;
    userId: string;
    memberNumber?: number | null;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
    email?: string | null;
  };
  stats: {
    totalEvents: number;
    registered: number;
    waitlisted: number;
    checkedIn: number;
  };
  events: Array<{
    registrationId: string;
    status: string;
    registeredAt: string;
    updatedAt: string;
    checkedInAt?: string | null;
    event: {
      id: string;
      title: string;
      description?: string | null;
      location?: string | null;
      startsAt: string;
      endsAt?: string | null;
      capacity?: number | null;
      status: "SCHEDULED" | "CANCELLED" | "COMPLETED";
    };
  }>;
};
type Member = {
  id: string;
  role?: string | null;
  memberNumber?: number | null;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: string | null;
  address?: string | null;
  phone?: string | null;
  user?: {
    email?: string | null;
  };
};

export default function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [member, setMember] = useState<Member | null>(null);
  const [history, setHistory] = useState<MemberHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [memberNumber, setMemberNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    async function loadMember() {
      try {
        const { id } = await params;
        const token = getAccessToken();
        const associationId = getActiveAssociationId();

        const response = await fetch("/api/memberships", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            ...(associationId
              ? { "x-association-id": associationId }
              : {}),
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Errore API");
        }

        const json = await response.json();

        const members: Member[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.members)
            ? json.members
            : Array.isArray(json?.data)
              ? json.data
              : [];

        const found = members.find(
          (item) => String(item.id) === String(id),
        );

        if (!found) {
          setError("Socio non trovato");
          return;
        }

        setMember(found);
        setFirstName(found.firstName ?? "");
        setLastName(found.lastName ?? "");
        setBirthDate(found.birthDate?.slice(0, 10) ?? "");
        setAddress(found.address ?? "");
        setPhone(found.phone ?? "");
      } catch (err) {
        console.error(err);
        setError("Errore nel caricamento della scheda socio");
      }
    }

    void loadMember();
  }, [params]);

  async function saveMember() {
    if (!member) return;

    if (!firstName.trim() || !lastName.trim()) {
      setError("Nome e cognome sono obbligatori");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = getAccessToken();
      const associationId = getActiveAssociationId();

      const response = await fetch(`/api/memberships/${member.id}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(associationId
            ? { "x-association-id": associationId }
            : {}),
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          birthDate: birthDate || undefined,
          address: address.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Errore durante il salvataggio",
        );
      }

      setMember((current) =>
        current
          ? {
              ...current,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              birthDate: birthDate || null,
              address: address.trim() || null,
              phone: phone.trim() || null,
            }
          : current,
      );

      setEditing(false);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Errore durante il salvataggio",
      );
    } finally {
      setSaving(false);
    }
  }

  if (error && !member) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/members"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna ai membri
          </Link>
          <p className="mt-6 text-red-300">{error}</p>
        </div>
      </main>
    );
  }

  if (!member) {
    return (
      <main className="p-6 text-gray-300">
        Caricamento scheda socio...
      </main>
    );
  }

  const name =
    [member.firstName, member.lastName]
      .filter(Boolean)
      .join(" ") ||
    member.user?.email ||
    "Membro";

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          body * {
            visibility: hidden !important;
          }

          .no-print {
            display: none !important;
          }

          html,
          body {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }

          main {
            min-height: 0 !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }

          .member-print-card,
          .member-print-card * {
            visibility: visible !important;
          }

          .member-print-card {
            display: block !important;
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            max-width: 85.6mm !important;
            max-height: 54mm !important;
            width: 85.6mm !important;
            height: 54mm !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 5mm !important;
            border: 0.4mm solid #111827 !important;
            border-radius: 4mm !important;
            background: white !important;
            color: #111827 !important;
            overflow: hidden !important;
            page-break-before: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
          }

          .member-print-card .print-muted {
            color: #6b7280 !important;
          }

          .member-print-card .print-dark {
            color: #111827 !important;
          }
        }
      `}</style>

      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-4xl">
          <div className="no-print mb-6 flex items-center justify-between">
            <Link
              href="/members"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna ai membri
            </Link>

            {!editing && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-white/10"
                >
                  <Printer className="h-4 w-4" />
                  Stampa tessera
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setEditing(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500"
                >
                  <Pencil className="h-4 w-4" />
                  Modifica socio
                </button>
              </div>
            )}

            {editing && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFirstName(member.firstName ?? "");
                    setLastName(member.lastName ?? "");
                    setBirthDate(member.birthDate?.slice(0, 10) ?? "");
                    setAddress(member.address ?? "");
                    setPhone(member.phone ?? "");
                    setError("");
                    setEditing(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                  Annulla
                </button>

                <button
                  type="button"
                  onClick={saveMember}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Salvataggio..." : "Salva"}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="no-print mb-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <section className="no-print rounded-2xl border border-white/10 bg-[#0f172a] p-6">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">Scheda socio</p>
                <h1 className="mt-2 text-3xl font-bold text-white">
                  {name}
                </h1>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-center">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Tessera
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {member.memberNumber ?? "-"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Nome</p>
                {editing ? (
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                  />
                ) : (
                  <p className="mt-1 text-lg text-white">{member.firstName ?? "-"}</p>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Cognome</p>
                {editing ? (
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                  />
                ) : (
                  <p className="mt-1 text-lg text-white">{member.lastName ?? "-"}</p>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Ruolo</p>
                <p className="mt-1 text-lg text-white">{member.role ?? "-"}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
                <p className="mt-1 break-words text-lg text-white">{member.user?.email ?? "-"}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Telefono</p>
                {editing ? (
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                  />
                ) : (
                  <p className="mt-1 text-lg text-white">{member.phone ?? "-"}</p>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Data di nascita</p>
                {editing ? (
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                  />
                ) : (
                  <p className="mt-1 text-lg text-white">
                    {member.birthDate ? member.birthDate.slice(0, 10) : "-"}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">Indirizzo</p>
                {editing ? (
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                  />
                ) : (
                  <p className="mt-1 text-lg text-white">{member.address ?? "-"}</p>
                )}
              </div>
            </div>
          </section>

                    <section className="mt-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Attività del socio
              </h2>
              <p className="mt-1 text-sm text-white/50">
                Partecipazione agli eventi e storico delle presenze.
              </p>
            </div>

            {historyLoading ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/50">
                Caricamento attività...
              </div>
            ) : historyError ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/5 p-6 text-sm text-red-300">
                {historyError}
              </div>
            ) : history ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">Eventi</span>
                      <CalendarDays size={17} className="text-white/40" />
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      {history.stats.totalEvents}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">Registrati</span>
                      <Users size={17} className="text-white/40" />
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      {history.stats.registered}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">
                        Lista d'attesa
                      </span>
                      <Clock3 size={17} className="text-white/40" />
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      {history.stats.waitlisted}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">Presenze</span>
                      <CheckCircle2 size={17} className="text-white/40" />
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      {history.stats.checkedIn}
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                  <div className="border-b border-white/10 px-5 py-4">
                    <h3 className="font-semibold text-white">
                      Storico eventi
                    </h3>
                  </div>

                  {history.events.length === 0 ? (
                    <div className="px-5 py-8 text-sm text-white/45">
                      Nessuna attività registrata.
                    </div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {history.events.map((registration) => {
                        const event = registration.event;
                        const isWaitlisted =
                          registration.status === "WAITLISTED";
                        const isCheckedIn =
                          Boolean(registration.checkedInAt);

                        const eventStatus =
                          event.status === "CANCELLED"
                            ? "Cancellato"
                            : event.status === "COMPLETED"
                              ? "Completato"
                              : "Programmato";

                        return (
                          <div
                            key={registration.registrationId}
                            className="px-5 py-4"
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-medium text-white">
                                    {event.title}
                                  </h4>

                                  <span
                                    className={
                                      isWaitlisted
                                        ? "rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-300"
                                        : isCheckedIn
                                          ? "rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-300"
                                          : "rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/50"
                                    }
                                  >
                                    {isWaitlisted
                                      ? "Lista d'attesa"
                                      : isCheckedIn
                                        ? "Presente"
                                        : "Registrato"}
                                  </span>

                                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/45">
                                    {eventStatus}
                                  </span>
                                </div>

                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
                                  <span className="inline-flex items-center gap-1.5">
                                    <CalendarDays size={13} />
                                    {new Date(
                                      event.startsAt,
                                    ).toLocaleDateString("it-IT", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })}
                                  </span>

                                  <span className="inline-flex items-center gap-1.5">
                                    <Clock3 size={13} />
                                    {new Date(
                                      event.startsAt,
                                    ).toLocaleTimeString("it-IT", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>

                                  {event.location && (
                                    <span className="inline-flex items-center gap-1.5">
                                      <MapPin size={13} />
                                      {event.location}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="shrink-0 text-xs text-white/40 lg:text-right">
                                <div>
                                  Iscritto il{" "}
                                  {new Date(
                                    registration.registeredAt,
                                  ).toLocaleDateString("it-IT")}
                                </div>

                                {registration.checkedInAt && (
                                  <div className="mt-1 text-emerald-300/70">
                                    Check-in{" "}
                                    {new Date(
                                      registration.checkedInAt,
                                    ).toLocaleDateString("it-IT")}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </section>
<section
            aria-hidden="true"
            className="member-print-card hidden"
          >
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="print-muted text-[6px] font-bold uppercase tracking-[0.2em]">
                    Associazione
                  </p>
                  <p className="print-dark mt-1 truncate text-[9px] font-black uppercase tracking-tight">
                    Gestione Associazione
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="print-muted text-[6px] font-bold uppercase tracking-[0.2em]">
                    Tessera
                  </p>
                  <p className="print-dark mt-0.5 text-[15px] font-black leading-none">
                    {member.memberNumber ?? "-"}
                  </p>
                </div>
              </div>

              <div className="my-2 border-t border-gray-200 pt-2">
                <p className="print-muted text-[6px] font-bold uppercase tracking-[0.18em]">
                  Socio
                </p>
                <p className="print-dark mt-1 truncate text-[15px] font-black leading-none">
                  {name}
                </p>
                <p className="print-muted mt-1 text-[7px] font-bold uppercase">
                  {member.role ?? "MEMBER"}
                </p>
              </div>

              <div className="flex min-h-0 items-end justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div>
                    <p className="print-muted text-[5.5px] font-bold uppercase">Email</p>
                    <p className="print-dark truncate text-[6.5px] leading-tight">
                      {member.user?.email ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="print-muted text-[5.5px] font-bold uppercase">Telefono</p>
                    <p className="print-dark text-[6.5px] leading-tight">
                      {member.phone ?? "-"}
                    </p>
                  </div>
                  <p className="print-muted truncate pt-0.5 text-[5.5px]">
                    ID: {member.id}
                  </p>
                </div>

                <div className="shrink-0 text-center">
                  <QRCodeSVG
                    value={`https://privat-non-publico-web-tckitalie-ship-its-projects.vercel.app/verify/${member.id}`}
                    size={64}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#111827"
                    includeMargin
                  />
                  <p className="print-muted mt-0.5 text-[4.5px] font-bold uppercase tracking-[0.12em]">
                    Verifica tessera
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}



