"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  Eye,
  Clock3,
  Loader2,
  MapPin,
  Pencil,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startAt: string;
  participants: number;
  capacity?: number | null;
  registrationEnabled?: boolean;
  status?: "SCHEDULED" | "CANCELLED" | "COMPLETED";
  isRegistered?: boolean;
  isWaitlisted?: boolean;
}

interface EventCardProps {
  event: EventItem;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRegister?: (id: string) => void;
  onUnregister?: (id: string) => void;
  onViewParticipants?: (id: string) => void;
  onViewDetail?: (id: string) => void;
  registrationLoading?: boolean;
  canManageEvents?: boolean;
}

export default function EventCard({
  event,
  onEdit,
  onDelete,
  onRegister,
  onUnregister,
  onViewParticipants,
  onViewDetail,
  registrationLoading = false,
  canManageEvents = false,
}: EventCardProps) {
  const eventDate = new Date(event.startAt);
  const [isPast, setIsPast] = useState(false);

  const eventStatus = event.status ?? "SCHEDULED";
  const capacity = event.capacity ?? null;

  const isFull =
    capacity !== null && event.participants >= capacity;

  const availablePlaces =
    capacity !== null
      ? Math.max(capacity - event.participants, 0)
      : null;

  const fillPercentage =
    capacity !== null && capacity > 0
      ? Math.min(
          Math.round(
            (event.participants / capacity) * 100,
          ),
          100,
        )
      : null;

  const registrationDisabled =
    !event.registrationEnabled ||
    eventStatus === "CANCELLED" ||
    eventStatus === "COMPLETED" ||
    isPast ||
    Boolean(event.isWaitlisted);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const startTime = new Date(event.startAt).getTime();

      setIsPast(
        !Number.isNaN(startTime) &&
          startTime < Date.now(),
      );
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [event.startAt]);

  function handleRegistration() {
    if (
      registrationLoading ||
      isPast ||
      registrationDisabled
    ) {
      return;
    }

    if (event.isRegistered || event.isWaitlisted) {
      onUnregister?.(event.id);
      return;
    }

    onRegister?.(event.id);
  }

  const statusLabel =
    eventStatus === "CANCELLED"
      ? "Cancellato"
      : eventStatus === "COMPLETED"
        ? "Completato"
        : isFull
          ? "Completo"
          : "Programmato";

  const statusClasses =
    eventStatus === "CANCELLED"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : eventStatus === "COMPLETED"
        ? "border-gray-500/20 bg-gray-500/10 text-gray-300"
        : isFull
          ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

  const registrationLabel =
    eventStatus === "CANCELLED"
      ? "Evento cancellato"
      : eventStatus === "COMPLETED"
        ? "Evento completato"
        : !event.registrationEnabled
          ? "Iscrizioni disabilitate"
          : isPast
            ? "Evento terminato"
            : event.isWaitlisted
              ? "In lista d'attesa"
              : event.isRegistered
                ? "Annulla iscrizione"
                : isFull
                ? "Entra in lista d'attesa"
                : "Partecipa";

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-[#1a1f2e] shadow-xl transition hover:border-indigo-500/40 hover:shadow-2xl">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
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
                eventStatus === "SCHEDULED" &&
                !isPast && (
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
                    Iscrizioni aperte
                  </span>
                )}

              {!event.registrationEnabled &&
                eventStatus === "SCHEDULED" && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-400">
                    Iscrizioni chiuse
                  </span>
                )}
            </div>

            <h3 className="break-words text-xl font-bold text-white">
              {event.title}
            </h3>

            {event.description && (
              <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-gray-400">
                {event.description}
              </p>
            )}
          </div>

          <div className="hidden shrink-0 rounded-2xl border border-indigo-500/10 bg-indigo-500/10 p-3 sm:block">
            <CalendarDays className="h-7 w-7 text-indigo-300" />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Data e ora
                </p>

                <p className="mt-1 text-sm font-medium text-gray-200">
                  {Number.isNaN(eventDate.getTime())
                    ? "Data non disponibile"
                    : eventDate.toLocaleString("it-IT", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#111827] p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" />

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Location
                </p>

                <p className="mt-1 break-words text-sm font-medium text-gray-200">
                  {event.location || "Nessuna sede"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/5 bg-[#111827] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 shrink-0 text-indigo-300" />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Partecipazione
                </p>

                <p className="mt-1 text-sm font-medium text-gray-200">
                  {capacity !== null
                    ? `${event.participants} / ${capacity} ${
                        event.participants === 1
                          ? "partecipante"
                          : "partecipanti"
                      }`
                    : `${event.participants} ${
                        event.participants === 1
                          ? "partecipante"
                          : "partecipanti"
                      }`}
                </p>
              </div>
            </div>

            {capacity !== null && (
              <span className="text-sm font-semibold text-gray-300">
                {fillPercentage}%
              </span>
            )}
          </div>

          {capacity !== null && (
            <>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{
                    width: `${fillPercentage}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                {availablePlaces === 0
                  ? "Evento al completo"
                  : `${availablePlaces} ${
                      availablePlaces === 1
                        ? "posto disponibile"
                        : "posti disponibili"
                    }`}
              </p>
            </>
          )}
        </div>

        {event.isRegistered && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
            <Check size={17} />
            Sei registrato a questo evento
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 border-t border-white/5 bg-[#111827]/60 p-4">
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
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : event.isRegistered ? (
            <UserMinus size={16} />
          ) : (
            <UserPlus size={16} />
          )}

          {registrationLoading
            ? "Attendere..."
            : registrationLabel}
        </button>

        <button
          type="button"
          onClick={() => onViewDetail?.(event.id)}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 px-4 py-2.5 text-sm text-cyan-300 transition hover:bg-cyan-500/10"
        >
          <Eye size={16} />
          Dettagli
        </button>

        {canManageEvents && (
          <>
            <button
              type="button"
              onClick={() => onEdit?.(event.id)}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/20 px-4 py-2.5 text-sm text-indigo-300 transition hover:bg-indigo-500/10"
            >
              <Pencil size={16} />
              Modifica
            </button>

            <button
              type="button"
              onClick={() =>
                onViewParticipants?.(event.id)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5"
            >
              <Users size={16} />
              Vedi partecipanti
            </button>

            <button
              type="button"
              onClick={() => onDelete?.(event.id)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-500/10"
            >
              <Trash2 size={16} />
              Elimina
            </button>
          </>
        )}
      </div>
    </article>
  );
}
