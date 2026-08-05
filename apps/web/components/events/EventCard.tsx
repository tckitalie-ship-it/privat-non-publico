"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startAt: string;
  participants: number;
  isRegistered?: boolean;
}

interface EventCardProps {
  event: EventItem;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRegister?: (id: string) => void;
  onUnregister?: (id: string) => void;
  registrationLoading?: boolean;
}

export default function EventCard({
  event,
  onEdit,
  onDelete,
  onRegister,
  onUnregister,
  registrationLoading = false,
}: EventCardProps) {
  const eventDate = new Date(event.startAt);
  const [isPast, setIsPast] = useState(false);

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
    if (registrationLoading || isPast) {
      return;
    }

    if (event.isRegistered) {
      onUnregister?.(event.id);
      return;
    }

    onRegister?.(event.id);
  }

  return (
    <article className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl transition hover:border-indigo-500/40">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="break-words text-xl font-bold text-white">
            {event.title}
          </h3>

          {event.description && (
            <p className="mt-2 break-words text-sm text-gray-400">
              {event.description}
            </p>
          )}
        </div>

        <CalendarDays className="h-8 w-8 shrink-0 text-indigo-300" />
      </div>

      <div className="mt-6 space-y-3 text-sm">
        <div className="flex items-center gap-3 text-gray-300">
          <Clock3 size={18} className="shrink-0" />

          <span>
            {Number.isNaN(eventDate.getTime())
              ? "Data non disponibile"
              : eventDate.toLocaleString("it-IT")}
          </span>
        </div>

        <div className="flex items-center gap-3 text-gray-300">
          <MapPin size={18} className="shrink-0" />

          <span>
            {event.location || "Nessuna sede"}
          </span>
        </div>

        <div className="flex items-center gap-3 text-gray-300">
          <Users size={18} className="shrink-0" />

          <span>
            {event.participants}{" "}
            {event.participants === 1
              ? "partecipante"
              : "partecipanti"}
          </span>
        </div>

        {event.isRegistered && (
          <div className="flex items-center gap-2 text-emerald-300">
            <Check size={17} />
            Sei registrato a questo evento
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleRegistration}
          disabled={registrationLoading || isPast}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
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
            : isPast
              ? "Evento terminato"
              : event.isRegistered
                ? "Annulla iscrizione"
                : "Partecipa"}
        </button>

        <button
          type="button"
          onClick={() => onEdit?.(event.id)}
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/20 px-4 py-2 text-sm text-indigo-300 transition hover:bg-indigo-500/10"
        >
          <Pencil size={16} />
          Modifica
        </button>

        <button
          type="button"
          onClick={() => onDelete?.(event.id)}
          className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
        >
          <Trash2 size={16} />
          Elimina
        </button>
      </div>
    </article>
  );
}