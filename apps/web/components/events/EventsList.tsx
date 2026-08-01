"use client";

import EventCard, {
  type EventItem,
} from "./EventCard";

interface EventsListProps {
  events: EventItem[];
  loading: boolean;
  registrationLoadingId?: string | null;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRegister?: (id: string) => void;
  onUnregister?: (id: string) => void;
}

export default function EventsList({
  events,
  loading,
  registrationLoadingId = null,
  onEdit,
  onDelete,
  onRegister,
  onUnregister,
}: EventsListProps) {
  if (loading) {
    return (
      <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl">
        <div className="h-40 animate-pulse rounded-2xl bg-[#111827]" />
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl">
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#111827] p-10 text-center text-gray-400">
          Nessun evento disponibile.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          Elenco Eventi
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Tutti gli eventi della tua associazione.
        </p>
      </div>

      <div className="grid gap-5">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={onEdit}
            onDelete={onDelete}
            onRegister={onRegister}
            onUnregister={onUnregister}
            registrationLoading={
              registrationLoadingId === event.id
            }
          />
        ))}
      </div>
    </section>
  );
}