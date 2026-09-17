"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpCircle, Loader2, UserMinus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { API_URL, getAccessToken } from "@/lib/api";

type Participant = {
  id: string;
  userId: string;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  membership?: {
    memberNumber?: number | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  checkedInAt?: string | null;
  status?: "REGISTERED" | "WAITLISTED" | string;
};

interface EventParticipantsModalProps {
  open: boolean;
  eventId: string | null;
  eventTitle?: string;
  onClose: () => void;
}

export default function EventParticipantsModal({
  open,
  eventId,
  eventTitle,
  onClose,
}: EventParticipantsModalProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [checkInLoadingId, setCheckInLoadingId] = useState<string | null>(null);
  const [participantSearch, setParticipantSearch] = useState("");
  const [participantFilter, setParticipantFilter] = useState<"ALL" | "REGISTERED" | "WAITLISTED" | "PRESENT" | "ABSENT">("ALL");

  useEffect(() => {
    if (!open || !eventId) {
      setParticipants([]);
      return;
    }

    const token = getAccessToken();

    if (!token) {
      toast.error("Sessione non disponibile");
      return;
    }

    let cancelled = false;

    async function loadParticipants() {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        30000,
      );

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_URL}/events/${eventId}/registrations`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            typeof data?.message === "string"
              ? data.message
              : "Impossibile caricare i partecipanti",
          );
        }

        if (!cancelled) {
          setParticipants(
            Array.isArray(data) ? data : [],
          );
          setError(null);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof DOMException && error.name === "AbortError"
              ? "Il server non ha risposto in tempo. Riprova."
              : error instanceof Error
                ? error.message
                : "Impossibile caricare i partecipanti";

          setError(message);
          toast.error(message);
        }
      } finally {
        window.clearTimeout(timeoutId);

        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadParticipants();

    return () => {
      cancelled = true;
    };
  }, [open, eventId]);

  async function updateCheckIn(userId: string, checkedIn: boolean) {
    if (!eventId) return;

    const token = getAccessToken();

    if (!token) {
      toast.error("Sessione non disponibile");
      return;
    }

    try {
      setCheckInLoadingId(userId);

      const response = await fetch(
        `${API_URL}/events/${eventId}/registrations/${userId}/check-in`,
        {
          method: checkedIn ? "POST" : "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${
            data?.message ||
            data?.error ||
            data?.details ||
            (checkedIn
              ? "Impossibile registrare il check-in"
              : "Impossibile annullare il check-in")
          }`,
        );
      }

      const checkedInAt =
        data?.checkedInAt ??
        data?.registration?.checkedInAt ??
        (checkedIn ? new Date().toISOString() : null);

      setParticipants((current) =>
        current.map((participant) =>
          participant.userId === userId
            ? { ...participant, checkedInAt }
            : participant,
        ),
      );

      toast.success(
        checkedIn ? "Check-in registrato" : "Check-in annullato",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Errore durante il check-in",
      );
    } finally {
      setCheckInLoadingId(null);
    }
  }
  async function removeParticipant(userId: string) {
    if (!eventId) return;

    const token = getAccessToken();

    if (!token) {
      toast.error("Sessione non disponibile");
      return;
    }

    try {
      setRemovingId(userId);

      const response = await fetch(
        `${API_URL}/events/${eventId}/registrations/${userId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : "Impossibile rimuovere il partecipante",
        );
      }

      setParticipants((current) =>
        current.filter(
          (participant) =>
            participant.userId !== userId,
        ),
      );

      toast.success("Partecipante rimosso");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile rimuovere il partecipante",
      );
    } finally {
      setRemovingId(null);
    }
  }

  async function promoteParticipant(userId: string) {
    if (!eventId) return;

    const token = getAccessToken();

    if (!token) {
      toast.error("Sessione non disponibile");
      return;
    }

    try {
      setPromotingId(userId);

      const response = await fetch(
        `${API_URL}/events/${eventId}/registrations/${userId}/promote`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : "Impossibile promuovere il partecipante",
        );
      }

      setParticipants((current) =>
        current.map((participant) =>
          participant.userId === userId
            ? {
                ...participant,
                status: "REGISTERED",
                checkedInAt: null,
              }
            : participant,
        ),
      );

      toast.success("Partecipante promosso dalla lista d'attesa");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile promuovere il partecipante",
      );
    } finally {
      setPromotingId(null);
    }
  }
  const filteredParticipants = useMemo(() => {
    const normalizedSearch =
      participantSearch.trim().toLowerCase();

    return participants.filter((participant) => {
      const firstName =
        participant.membership?.firstName?.trim() || "";
      const lastName =
        participant.membership?.lastName?.trim() || "";
      const fullName = [firstName, lastName]
        .filter(Boolean)
        .join(" ");

      const email =
        participant.user?.email?.trim() || "";

      const memberNumber =
        participant.membership?.memberNumber != null
          ? String(participant.membership.memberNumber)
          : "";

      const matchesSearch =
        normalizedSearch === "" ||
        fullName.toLowerCase().includes(normalizedSearch) ||
        email.toLowerCase().includes(normalizedSearch) ||
        memberNumber.includes(normalizedSearch);

      const checkedIn =
        Boolean(participant.checkedInAt);
      const registered = participant.status === "REGISTERED";
      const waitlisted = participant.status === "WAITLISTED";

      const matchesFilter =
        participantFilter === "ALL" ||
        (participantFilter === "REGISTERED" && registered) ||
        (participantFilter === "WAITLISTED" && waitlisted) ||
        (participantFilter === "PRESENT" && registered && checkedIn) ||
        (participantFilter === "ABSENT" && registered && !checkedIn);

      return matchesSearch && matchesFilter;
    });
  }, [
    participants,
    participantSearch,
    participantFilter,
  ]);

  if (!open) return null;

  const registeredCount = participants.filter(
    (participant) => participant.status === "REGISTERED",
  ).length;

  const waitlistedCount = participants.filter(
    (participant) => participant.status === "WAITLISTED",
  ).length;

  const checkedInCount = participants.filter(
    (participant) =>
      participant.status === "REGISTERED" &&
      Boolean(participant.checkedInAt),
  ).length;

  const absentCount =
    registeredCount - checkedInCount;

  const attendanceRate =
    registeredCount > 0
      ? Math.round(
          (checkedInCount / registeredCount) * 100,
        )
      : 0;



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#1a1f2e] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10">
              <Users className="h-5 w-5 text-indigo-300" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Partecipanti
              </h2>

              <p className="max-w-xs truncate text-sm text-gray-400">
                {eventTitle || "Evento"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 border-b border-white/10 p-4 sm:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-gray-500">Registrati</p>
            <p className="mt-1 text-xl font-bold text-white">
              {registeredCount}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-3">
            <p className="text-xs text-gray-500">Lista d'attesa</p>
            <p className="mt-1 text-xl font-bold text-amber-300">
              {waitlistedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-3">
            <p className="text-xs text-gray-500">Presenti</p>
            <p className="mt-1 text-xl font-bold text-emerald-300">
              {checkedInCount}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-500/10 bg-orange-500/5 p-3">
            <p className="text-xs text-gray-500">Assenti</p>
            <p className="mt-1 text-xl font-bold text-orange-300">
              {absentCount}
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-500/10 bg-indigo-500/5 p-3">
            <p className="text-xs text-gray-500">Presenza</p>
            <p className="mt-1 text-xl font-bold text-indigo-300">
              {attendanceRate}%
            </p>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {!loading && !error && participants.length > 0 && (
            <div className="mb-5 space-y-3">
              <input
                type="search"
                value={participantSearch}
                onChange={(event) =>
                  setParticipantSearch(event.target.value)
                }
                placeholder="Cerca nome, email o numero tessera..."
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500/50"
              />

              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    ["ALL", `Tutti (${participants.length})`],
                    ["REGISTERED", `Registrati (${registeredCount})`],
                    ["WAITLISTED", `Lista d'attesa (${waitlistedCount})`],
                    ["PRESENT", `Presenti (${checkedInCount})`],
                    ["ABSENT", `Assenti (${absentCount})`],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setParticipantFilter(value)
                    }
                    className={
                      participantFilter === value
                        ? "rounded-xl bg-indigo-500/20 px-3 py-2 text-xs font-medium text-indigo-200 ring-1 ring-indigo-400/30"
                        : "rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
                    }
                  >
                    {label}
                  </button>
                ))}

                <span className="ml-auto text-xs text-gray-500">
                  {filteredParticipants.length} risultati
                </span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2
                size={22}
                className="mr-2 animate-spin"
              />
              Caricamento partecipanti...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10 text-center">
              <p className="font-medium text-red-300">
                Impossibile caricare i partecipanti
              </p>
              <p className="mt-2 text-sm text-gray-400">
                {error}
              </p>
            </div>
          ) : participants.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#111827] px-6 py-12 text-center">
              <Users className="mx-auto h-8 w-8 text-gray-500" />

              <p className="mt-3 font-medium text-white">
                Nessun partecipante
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Nessuno si � ancora registrato a questo evento.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredParticipants.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#111827] px-6 py-10 text-center">
                  <Users className="mx-auto h-7 w-7 text-gray-500" />
                  <p className="mt-3 font-medium text-white">
                    Nessun risultato
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Prova a modificare la ricerca o il filtro.
                  </p>
                </div>
              ) : (
                filteredParticipants.map((participant) => {
                const user = participant.user;

                const firstName =
                  participant.membership?.firstName?.trim() || "";
                const lastName =
                  participant.membership?.lastName?.trim() || "";

                const fullName = [firstName, lastName]
                  .filter(Boolean)
                  .join(" ");

                const displayName =
                  fullName ||
                  user?.name?.trim() ||
                  user?.email ||
                  participant.userId;

                const checkedIn = Boolean(participant.checkedInAt);

                return (
                  <div
                    key={participant.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111827] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300">
                        <Users size={18} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium text-white">
                            {displayName}
                          </p>

                          {participant.membership?.memberNumber != null && (
                            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[11px] font-medium text-cyan-200">
                              Tessera #{participant.membership.memberNumber}
                            </span>
                          )}

                          <span
                            className={
                              participant.status === "WAITLISTED"
                                ? "rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-300"
                                : checkedIn
                                  ? "rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300"
                                  : "rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-white/50"
                            }
                          >
                            {participant.status === "WAITLISTED"
                              ? "In lista d'attesa"
                              : checkedIn
                                ? "Presente"
                                : "Non presente"}
                          </span>
                        </div>

                        {user?.email && (
                          <p className="mt-1 truncate text-xs text-gray-500">
                            {user.email}
                          </p>
                        )}

                        {checkedIn && participant.checkedInAt && (
                          <p className="mt-1 text-xs text-emerald-300/70">
                            Check-in:{" "}
                            {new Date(
                              participant.checkedInAt,
                            ).toLocaleString("it-IT", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {participant.status === "WAITLISTED" && (
                        <button
                          type="button"
                          disabled={promotingId === participant.userId}
                          onClick={() =>
                            void promoteParticipant(
                              participant.userId,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {promotingId === participant.userId ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <ArrowUpCircle size={14} />
                          )}
                          {promotingId === participant.userId
                            ? "Promozione..."
                            : "Promuovi"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          void updateCheckIn(
                            participant.userId,
                            !checkedIn,
                          )
                        }
                        disabled={
                          participant.status === "WAITLISTED" ||
                          checkInLoadingId === participant.userId
                        }
                        className={
                          participant.status === "WAITLISTED"
                            ? "inline-flex items-center gap-2 rounded-xl border border-amber-500/20 px-3 py-2 text-xs font-medium text-amber-300/60 cursor-not-allowed"
                            : checkedIn
                              ? "inline-flex items-center gap-2 rounded-xl border border-amber-500/20 px-3 py-2 text-xs font-medium text-amber-300 transition hover:bg-amber-500/10"
                              : "inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/10"
                        }
                      >
                        {participant.status === "WAITLISTED"
                          ? "In lista d'attesa"
                          : checkInLoadingId === participant.userId
                            ? "Aggiornamento..."
                            : checkedIn
                              ? "Annulla check-in"
                              : "Check-in"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          removingId === participant.userId
                        }
                        onClick={() =>
                          void removeParticipant(
                            participant.userId,
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {removingId === participant.userId ? (
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <UserMinus size={14} />
                        )}
                        Rimuovi
                      </button>
                    </div>
                  </div>
                );
              })
              )}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 px-6 py-4">
          <p className="text-sm text-gray-400">
            Totale:{" "}
            <span className="font-semibold text-white">
              {participants.length}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}






