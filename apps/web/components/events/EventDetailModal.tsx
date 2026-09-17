"use client";

import { createPortal } from "react-dom";
import {
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  MapPin,
  Pencil,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";

export interface EventDetailItem {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startAt: string;
  participants: number;
  capacity?: number | null;
  registrationEnabled?: boolean;
  status?: "SCHEDULED" | "CANCELLED" | "COMPLETED";
  isRegistered?: boolean;
  isWaitlisted?: boolean;
}

interface EventDetailModalProps {
  open: boolean;
  event: EventDetailItem | null;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRegister?: (id: string) => void;
  onUnregister?: (id: string) => void;
  onViewParticipants?: (id: string) => void;
  registrationLoading?: boolean;
  canManageEvents?: boolean;
}

export default function EventDetailModal({
  open,
  event,
  onClose,
  onEdit,
  onDelete,
  onRegister,
  onUnregister,
  onViewParticipants,
  registrationLoading = false,
  canManageEvents = false,
}: EventDetailModalProps) {
  if (!open || !event) {
    return null;
  }

  const eventDate = new Date(event.startAt);
  const capacity = event.capacity ?? null;

  const isPast =
    !Number.isNaN(eventDate.getTime()) &&
    eventDate.getTime() < Date.now();

  const status = event.status ?? "SCHEDULED";

  const isFull =
    capacity !== null &&
    event.participants >= capacity;

  const availablePlaces =
    capacity !== null
      ? Math.max(capacity - event.participants, 0)
      : null;

  const registrationDisabled =
    !event.registrationEnabled ||
    status === "CANCELLED" ||
    status === "COMPLETED" ||
    isPast ||
    (!event.isRegistered && !event.isWaitlisted && isFull);

  const statusLabel =
    status === "CANCELLED"
      ? "Cancellato"
      : status === "COMPLETED"
        ? "Completato"
        : isFull
          ? "Completo"
          : "Programmato";

  const occupancyRate =
    capacity !== null && capacity > 0
      ? Math.min(
          Math.round((event.participants / capacity) * 100),
          100,
        )
      : null;

  const registrationStatusLabel =
    status === "CANCELLED"
      ? "Evento cancellato"
      : status === "COMPLETED"
        ? "Evento completato"
        : !event.registrationEnabled
          ? "Iscrizioni chiuse"
          : isPast
            ? "Evento terminato"
            : event.isWaitlisted
              ? "Sei in lista d'attesa"
              : isFull
                ? "Evento al completo"
                : "Iscrizioni aperte";

  const statusClasses =
    status === "CANCELLED"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : status === "COMPLETED"
        ? "border-gray-500/20 bg-gray-500/10 text-gray-300"
        : isFull
          ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

  function handleRegistration() {
    if (!event) {
      return;
    }

    if (registrationDisabled || registrationLoading) {
      return;
    }

    if (event.isRegistered || event.isWaitlisted) {
      onUnregister?.(event.id);
    } else {
      onRegister?.(event.id);
    }
  }

  const registrationLabel =
    status === "CANCELLED"
      ? "Evento cancellato"
      : status === "COMPLETED"
        ? "Evento completato"
        : !event.registrationEnabled
          ? "Iscrizioni disabilitate"
          : event.isWaitlisted
            ? "Esci dalla lista d'attesa"
            : isFull && !event.isRegistered
              ? "Evento al completo"
              : isPast
                ? "Evento terminato"
                : event.isRegistered
                  ? "Annulla iscrizione"
                  : "Partecipa";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#1a1f2e] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#1a1f2e] p-6">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={
                  "rounded-full border px-3 py-1 text-xs font-semibold " +
                  statusClasses
                }
              >
                {statusLabel}
              </span>

              {event.registrationEnabled &&
                status === "SCHEDULED" &&
                !isPast && (
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
                    Iscrizioni aperte
                  </span>
                )}
            </div>

            <h2 className="break-words text-2xl font-bold text-white">
              {event.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi dettaglio evento"
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" />

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Data
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-200">
                    {Number.isNaN(eventDate.getTime())
                      ? "Data non disponibile"
                      : eventDate.toLocaleDateString("it-IT", {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
              <div className="flex gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" />

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Orario
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-200">
                    {Number.isNaN(eventDate.getTime())
                      ? "--:--"
                      : eventDate.toLocaleTimeString("it-IT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Location
                </p>

                <p className="mt-1 text-sm font-medium text-gray-200">
                  {event.location || "Nessuna sede specificata"}
                </p>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Descrizione
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-300">
                {event.description}
              </p>
            </div>
          )}

          <div
            className={[
              "rounded-2xl border p-4",
              isFull
                ? "border-amber-500/20 bg-amber-500/5"
                : "border-white/5 bg-[#111827]",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <Users
                  className={[
                    "mt-0.5 h-5 w-5 shrink-0",
                    isFull ? "text-amber-300" : "text-indigo-300",
                  ].join(" ")}
                />

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Partecipazione
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-100">
                    {capacity !== null
                      ? `${event.participants} / ${capacity} partecipanti`
                      : `${event.participants} ${
                          event.participants === 1
                            ? "partecipante"
                            : "partecipanti"
                        }`}
                  </p>
                </div>
              </div>

              {capacity !== null && (
                <span
                  className={[
                    "shrink-0 text-sm font-semibold",
                    isFull ? "text-amber-300" : "text-indigo-300",
                  ].join(" ")}
                >
                  {isFull ? "Completo" : `${availablePlaces} disponibili`}
                </span>
              )}
            </div>

            {capacity !== null && capacity > 0 && (
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Occupazione</span>
                  <span>{occupancyRate ?? 0}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={[
                      "h-full rounded-full transition-all",
                      isFull ? "bg-amber-500" : "bg-indigo-500",
                    ].join(" ")}
                    style={{
                      width: `${occupancyRate ?? 0}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Stato iscrizioni
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-200">
                {registrationStatusLabel}
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Occupazione
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-200">
                {occupancyRate !== null
                  ? `${occupancyRate}% della capienza`
                  : "Capienza illimitata"}
              </p>
            </div>
          </div>

          {event.isRegistered && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
              <Check className="h-4 w-4" />
              Sei registrato a questo evento
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 border-t border-white/10 bg-[#111827]/60 p-6">
          <button
            type="button"
            onClick={handleRegistration}
            disabled={
              registrationDisabled ||
              registrationLoading
            }
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
              event.isRegistered
                ? "border border-amber-500/20 text-amber-300 hover:bg-amber-500/10"
                : "bg-emerald-600 text-white hover:bg-emerald-500"
            }`}
          >
            {registrationLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : event.isRegistered ? (
              <UserMinus className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}

            {registrationLoading
              ? "Attendere..."
              : registrationLabel}
          </button>

          {canManageEvents && (
            <>
              <button
                type="button"
                onClick={() => onEdit?.(event.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/20 px-4 py-2.5 text-sm text-indigo-300 transition hover:bg-indigo-500/10"
              >
                <Pencil className="h-4 w-4" />
                Modifica
              </button>

              <button
                type="button"
                onClick={() =>
                  onViewParticipants?.(event.id)
                }
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5"
              >
                <Users className="h-4 w-4" />
                Partecipanti
              </button>

              <button
                type="button"
                onClick={() => onDelete?.(event.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Elimina
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
