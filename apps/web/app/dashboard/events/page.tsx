"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import EventCalendar from "@/components/events/EventCalendar";
import EventFilters from "@/components/events/EventFilters";
import EventsHeader from "@/components/events/EventsHeader";
import EventsList from "@/components/events/EventsList";
import EventsStats from "@/components/events/EventsStats";
import CreateEventModal from "@/components/events/CreateEventModal";
import EditEventModal from "@/components/events/EditEventModal";
import EventParticipantsModal from "@/components/events/EventParticipantsModal";
import EventDetailModal from "@/components/events/EventDetailModal";


import type { EventItem } from "@/components/events/EventCard";

import { API_URL, getAccessToken } from "@/lib/api";

type DashboardEvent = {
  id: string;
  associationId: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt?: string | null;
  capacity?: number | null;
  registrationEnabled?: boolean;
  status?: "SCHEDULED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  updatedAt?: string;
  registrations?: {
    id: string;
    userId: string;
    status?: string;
  }[];
};

type MembershipResponse = {
  id: string;
  associationId?: string;
  role: string;
  association?: {
    id: string;
    name: string;
  };
};

type ApiErrorResponse = {
  message?: string | string[];
};

function getErrorMessage(
  data: ApiErrorResponse | null,
  fallback: string,
) {
  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  return fallback;
}

function getCurrentUserId() {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return null;
    }

    const normalized = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payload = JSON.parse(
      decodeURIComponent(
        Array.from(atob(normalized))
          .map(
            (character) =>
              `%${character
                .charCodeAt(0)
                .toString(16)
                .padStart(2, "0")}`,
          )
          .join(""),
      ),
    ) as { sub?: unknown };

    return typeof payload.sub === "string"
      ? payload.sub
      : null;
  } catch {
    return null;
  }
}

async function requestAssociationId(
  currentAssociationId: string | null,
): Promise<string> {
  if (currentAssociationId) {
    return currentAssociationId;
  }

  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Sessione non disponibile. Effettua nuovamente il login.",
    );
  }

  const response = await fetch(
    `${API_URL}/memberships/me`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const data =
    (await response
      .json()
      .catch(() => null)) as
      | (MembershipResponse & ApiErrorResponse)
      | null;

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        `Errore associazione (${response.status})`,
      ),
    );
  }

  const resolvedId =
    data?.associationId ??
    data?.association?.id;

  if (!resolvedId) {
    throw new Error(
      "Nessuna associazione attiva disponibile.",
    );
  }

  return resolvedId;
}

async function requestEvents(
  currentAssociationId: string | null,
): Promise<{
  associationId: string;
  events: DashboardEvent[];
}> {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Sessione non disponibile. Effettua nuovamente il login.",
    );
  }

  const resolvedAssociationId =
    await requestAssociationId(
      currentAssociationId,
    );

  const response = await fetch(
    `${API_URL}/events/association/${resolvedAssociationId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const data =
    (await response
      .json()
      .catch(() => null)) as
      | DashboardEvent[]
      | ApiErrorResponse
      | null;

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data as ApiErrorResponse | null,
        `Errore caricamento eventi (${response.status})`,
      ),
    );
  }

  return {
    associationId: resolvedAssociationId,
    events: Array.isArray(data)
      ? data
      : [],
  };
}

export default function DashboardEventsPage() {
  const [events, setEvents] =
    useState<DashboardEvent[]>([]);

  const [
    associationId,
    setAssociationId,
  ] = useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [
    registrationLoadingId,
    setRegistrationLoadingId,
  ] = useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] = useState<
    "ALL" | "UPCOMING" | "PAST"
  >("ALL");

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [editEvent, setEditEvent] =
    useState<DashboardEvent | null>(null);

  const [participantsOpen, setParticipantsOpen] =
    useState(false);

  const [participantsEvent, setParticipantsEvent] =
    useState<DashboardEvent | null>(null);

  const [detailEvent, setDetailEvent] =
    useState<DashboardEvent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const currentUserId =
    getCurrentUserId();

  const [currentUserRole, setCurrentUserRole] =
    useState<string | null>(null);

  const canManageEvents =
    currentUserRole === "OWNER" ||
    currentUserRole === "ADMIN";

  const loadEvents = useCallback(
    async () => {
      try {
        setLoading(true);

        const result =
          await requestEvents(
            associationId,
          );

        setAssociationId(
          result.associationId,
        );
        setEvents(result.events);

        setDetailEvent((currentDetail) => {
          if (!currentDetail) {
            return currentDetail;
          }

          return (
            result.events.find(
              (event) => event.id === currentDetail.id,
            ) ?? null
          );
        });
      } catch (error) {
        console.error(
          "Errore caricamento eventi:",
          error,
        );

        setEvents([]);

        toast.error(
          error instanceof Error
            ? error.message
            : "Impossibile caricare gli eventi",
        );
      } finally {
        setLoading(false);
      }
    },
    [associationId],
  );

  useEffect(() => {
    let cancelled = false;

    async function initializeEvents() {
      try {
        const result =
          await requestEvents(null);

        if (cancelled) {
          return;
        }

        setAssociationId(
          result.associationId,
        );
        setEvents(result.events);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Errore caricamento eventi:",
          error,
        );

        setEvents([]);

        toast.error(
          error instanceof Error
            ? error.message
            : "Impossibile caricare gli eventi",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initializeEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUserRole() {
      const token = getAccessToken();

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/memberships/me`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          console.error(
            "Errore recupero membership:",
            response.status,
          );
          return;
        }

        const data =
          (await response.json()) as MembershipResponse;

        if (!cancelled) {
          setCurrentUserRole(
            typeof data.role === "string"
              ? data.role.toUpperCase()
              : null,
          );
        }
      } catch (error) {
        console.error(
          "Errore recupero ruolo utente:",
          error,
        );
      }
    }

    void loadCurrentUserRole();

    return () => {
      cancelled = true;
    };
  }, []);

  async function deleteEvent(id: string) {
    const token = getAccessToken();

    if (!token) {
      toast.error(
        "Sessione non disponibile",
      );
      return;
    }

    const confirmed = window.confirm(
      "Vuoi davvero eliminare questo evento?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      const response = await fetch(
        `${API_URL}/events/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept:
              "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | ApiErrorResponse
          | null;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Errore eliminazione evento (${response.status})`,
          ),
        );
      }

      toast.success(
        "Evento eliminato",
      );

      setEvents((currentEvents) =>
        currentEvents.filter(
          (event) => event.id !== id,
        ),
      );
    } catch (error) {
      console.error(
        "Errore eliminazione evento:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile eliminare l'evento",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function registerToEvent(
    eventId: string,
  ) {
    const token = getAccessToken();

    if (!token) {
      toast.error(
        "Sessione non disponibile",
      );
      return;
    }

    try {
      setRegistrationLoadingId(eventId);

      const response = await fetch(
        `${API_URL}/events/${eventId}/register`,
        {
          method: "POST",
          headers: {
            Accept:
              "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | ApiErrorResponse
          | null;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Errore registrazione (${response.status})`,
          ),
        );
      }

      toast.success(
        "Registrazione completata",
      );

      await loadEvents();
    } catch (error) {
      console.error(
        "Errore registrazione evento:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile registrarsi all'evento",
      );
    } finally {
      setRegistrationLoadingId(null);
    }
  }

  async function unregisterFromEvent(
    eventId: string,
  ) {
    const token = getAccessToken();

    if (!token) {
      toast.error(
        "Sessione non disponibile",
      );
      return;
    }

    try {
      setRegistrationLoadingId(eventId);

      const response = await fetch(
        `${API_URL}/events/${eventId}/register`,
        {
          method: "DELETE",
          headers: {
            Accept:
              "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | ApiErrorResponse
          | null;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Errore annullamento (${response.status})`,
          ),
        );
      }

      toast.success(
        "Iscrizione annullata",
      );

      await loadEvents();
    } catch (error) {
      console.error(
        "Errore annullamento iscrizione:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile annullare l'iscrizione",
      );
    } finally {
      setRegistrationLoadingId(null);
    }
  }

  const filteredEvents = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return events.filter((event) => {
      const title =
        event.title?.toLowerCase() ?? "";

      const description =
        event.description?.toLowerCase() ??
        "";

      const location =
        event.location?.toLowerCase() ?? "";

      const matchesSearch =
        normalizedSearch.length === 0 ||
        title.includes(normalizedSearch) ||
        description.includes(
          normalizedSearch,
        ) ||
        location.includes(
          normalizedSearch,
        );

      const startsAt =
        new Date(event.startsAt);

      const isUpcoming =
        !Number.isNaN(
          startsAt.getTime(),
        ) &&
        startsAt >= new Date();

      const matchesStatus =
        status === "ALL" ||
        (status === "UPCOMING" &&
          isUpcoming) ||
        (status === "PAST" &&
          !isUpcoming);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [events, search, status]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();

    return events.filter((event) => {
      const eventDate =
        new Date(event.startsAt);

      return (
        !Number.isNaN(
          eventDate.getTime(),
        ) &&
        eventDate >= now
      );
    }).length;
  }, [events]);

  const eventCards: EventItem[] =
    filteredEvents.map((event) => {
      const registrations =
        Array.isArray(
          event.registrations,
        )
          ? event.registrations
          : [];

      return {
        id: event.id,
        title: event.title,
        description:
          event.description ?? "",
        location:
          event.location ??
          "Luogo non specificato",
        startAt: event.startsAt,
        participants:
            registrations.filter(
              (registration) =>
                registration.status === "REGISTERED",
            ).length,
        capacity:
          event.capacity ?? null,
        registrationEnabled:
          event.registrationEnabled ?? true,
        status:
          event.status ?? "SCHEDULED",
        isRegistered:
          Boolean(currentUserId) &&
          registrations.some(
            (registration) =>
              registration.userId === currentUserId &&
              registration.status === "REGISTERED",
          ),
        isWaitlisted:
          Boolean(currentUserId) &&
          registrations.some(
            (registration) =>
              registration.userId === currentUserId &&
              registration.status === "WAITLISTED",
          ),
      };
    });

  const calendarEvents =
    filteredEvents.map((event) => ({
      id: event.id,
      title: event.title,
      startAt: event.startsAt,
    }));

  const locationsCount = new Set(
    events
      .map((event) =>
        event.location?.trim(),
      )
      .filter(
        (
          location,
        ): location is string =>
          Boolean(location),
      ),
  ).size;

  const totalParticipants =
    events.reduce(
      (total, event) =>
        total +
        (Array.isArray(
          event.registrations,
        )
          ? event.registrations.filter(
                (registration) =>
                  registration.status === "REGISTERED",
              ).length
          : 0),
      0,
    );

  const completedEvents = events.filter(
    (event) =>
      event.status === "COMPLETED" ||
      (event.status === "SCHEDULED" &&
        new Date(event.startsAt).getTime() < Date.now()),
  ).length;

  const capacityParticipants = events.reduce(
    (total, event) => {
      if (
        event.capacity === null ||
        event.capacity === undefined
      ) {
        return total;
      }

      const registered = Array.isArray(
        event.registrations,
      )
        ? event.registrations.filter(
            (registration) =>
              registration.status === "REGISTERED",
          ).length
        : 0;

      return total + registered;
    },
    0,
  );
const eventsWithCapacity = events.filter(
  (event) =>
    event.capacity !== null &&
    event.capacity !== undefined,
);

const openRegistrations = events.filter(
    (event) =>
      event.registrationEnabled !== false &&
      event.status !== "CANCELLED" &&
      event.status !== "COMPLETED",
  ).length;

const availablePlaces = events.reduce(
    (total, event) => {
      if (
        event.capacity === null ||
        event.capacity === undefined
      ) {
        return total;
      }

      const registered = Array.isArray(
        event.registrations,
      )
        ? event.registrations.filter(
            (registration) =>
              registration.status === "REGISTERED",
          ).length
        : 0;
      return total +
        Math.max(event.capacity - registered, 0);
    },
    0,
  );

  return (
    <div className="min-w-0 space-y-8">
      <EventsHeader
        eventsCount={events.length}
        upcomingCount={
          upcomingEvents
        }
        onCreate={
          canManageEvents
            ? () => {
                setCreateOpen(true);
              }
            : undefined
        }
      />

      <EventsStats
        totalEvents={events.length}
        upcomingEvents={
          upcomingEvents
        }
        completedEvents={
          completedEvents
        }
        participants={
          totalParticipants
        }
        capacityParticipants={
          capacityParticipants
        }        availablePlaces={
          eventsWithCapacity.length > 0
            ? availablePlaces
            : null
        }
        locations={locationsCount}
        eventsWithCapacity={eventsWithCapacity.length}
        openRegistrations={openRegistrations}
      />

      <EventFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={(value) =>
          setStatus(
            value as
              | "ALL"
              | "UPCOMING"
              | "PAST",
          )
        }
      />
      <EventCalendar
        events={calendarEvents}
        onEventClick={(id) => {
          const event = events.find(
            (item) => item.id === id,
          );

          if (!event) {
            toast.error("Evento non trovato");
            return;
          }

          setDetailEvent(events.find((item) => item.id === event.id) ?? event);
          setDetailOpen(true);
        }}
      />

      <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-xl">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Tabellino giornaliero
            </h2>
            <p className="text-sm text-gray-400">
              Agenda operativa degli eventi in ordine cronologico.
            </p>
          </div>

          <span className="text-sm text-gray-400">
            {filteredEvents.length}{" "}
            {filteredEvents.length === 1 ? "evento" : "eventi"}
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-gray-500">
            Nessun evento corrisponde ai filtri selezionati.
          </div>
        ) : (
          <div className="space-y-3">
            {[...filteredEvents]
              .sort(
                (a, b) =>
                  new Date(a.startsAt).getTime() -
                  new Date(b.startsAt).getTime(),
              )
              .map((event) => {
                const registrations = Array.isArray(event.registrations)
                  ? event.registrations
                  : [];

                const participants = registrations.filter(
                    (registration) =>
                      registration.status === "REGISTERED",
                  ).length;
                const capacity = event.capacity ?? null;
                const eventDate = new Date(event.startsAt);

                const timeLabel = Number.isNaN(eventDate.getTime())
                  ? "--:--"
                  : eventDate.toLocaleTimeString("it-IT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                const dateLabel = Number.isNaN(eventDate.getTime())
                  ? "Data non disponibile"
                  : eventDate.toLocaleDateString("it-IT", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                    });

                const statusLabel =
                  event.status === "CANCELLED"
                    ? "Cancellato"
                    : event.status === "COMPLETED"
                      ? "Completato"
                      : "Programmato";

                const statusClass =
                  event.status === "CANCELLED"
                    ? "border-red-500/20 bg-red-500/10 text-red-300"
                    : event.status === "COMPLETED"
                      ? "border-gray-500/20 bg-gray-500/10 text-gray-300"
                      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

                return (
                  <div
                    key={event.id}
                    className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:grid-cols-[110px_minmax(0,1fr)_170px]"
                  >
                    <div className="flex flex-row gap-3 lg:flex-col lg:gap-1">
                      <span className="text-sm font-semibold capitalize text-indigo-300">
                        {dateLabel}
                      </span>

                      <span className="text-lg font-bold text-white">
                        {timeLabel}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-white">
                        {event.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
                        <span>
                          📍 {event.location?.trim() || "Luogo non specificato"}
                        </span>

                        <span>
                          👥 {participants}
                          {capacity !== null ? ` / ${capacity}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-stretch gap-2 lg:items-end">
                      <span
                        className={`w-fit rounded-lg border px-3 py-1.5 text-xs font-medium ${statusClass}`}
                      >
                        {statusLabel}
                      </span>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setDetailEvent(events.find((item) => item.id === event.id) ?? event);
                            setDetailOpen(true);
                          }}
                          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:bg-white/[0.08]"
                        >
                          Dettagli
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setParticipantsEvent(event);
                            setParticipantsOpen(true);
                          }}
                          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:bg-white/[0.08]"
                        >
                          Partecipanti
                        </button>

                        {canManageEvents && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditEvent(event);
                              setEditOpen(true);
                            }}
                            className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/20"
                          >
                            Modifica
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {deletingId && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">
          Eliminazione evento in corso...
        </div>
      )}

      <EventsList
        events={eventCards}
        loading={loading}
        registrationLoadingId={
          registrationLoadingId
        }
        onRegister={(id) => {
          void registerToEvent(id);
        }}
        onUnregister={(id) => {
          void unregisterFromEvent(id);
        }}
        onEdit={(id) => {
          const event = events.find(
            (item) => item.id === id,
          );

          if (!event) {
            toast.error(
              "Evento non trovato",
            );
            return;
          }

          setEditEvent(event);
          setEditOpen(true);
        }}
        onDelete={(id) => {
          void deleteEvent(id);
        }}
        onViewParticipants={(id) => {
          const event = events.find(
            (item) => item.id === id,
          );

          if (!event) {
            toast.error("Evento non trovato");
            return;
          }

          setParticipantsEvent(event);
          setParticipantsOpen(true);
        }}
        onViewDetail={(id) => {
          const event = events.find(
            (item) => item.id === id,
          );

          if (!event) {
            toast.error("Evento non trovato");
            return;
          }

          setDetailEvent(events.find((item) => item.id === event.id) ?? event);
          setDetailOpen(true);
        }}
        canManageEvents={canManageEvents}
      />

      <EventDetailModal
        open={detailOpen}
        event={
          detailEvent
            ? {
                id: detailEvent.id,
                title: detailEvent.title,
                description: detailEvent.description,
                location: detailEvent.location,
                startAt: detailEvent.startsAt,
                participants: detailEvent.registrations?.filter(
                  (registration) =>
                    registration.status === "REGISTERED",
                ).length ?? 0,
                capacity: detailEvent.capacity,
                registrationEnabled: detailEvent.registrationEnabled,
                status: detailEvent.status,
                isRegistered:
                  detailEvent.registrations?.some(
                    (registration) =>
                      registration.userId === currentUserId &&
                      registration.status === "REGISTERED",
                  ) ?? false,
                isWaitlisted:
                  detailEvent.registrations?.some(
                    (registration) =>
                      registration.userId === currentUserId &&
                      registration.status === "WAITLISTED",
                  ) ?? false,
              }
            : null
        }
        onClose={() => {
          setDetailOpen(false);
          setDetailEvent(null);
        }}
        onRegister={(id) => {
          void registerToEvent(id);
        }}
        onUnregister={(id) => {
          void unregisterFromEvent(id);
        }}
        onEdit={(id) => {
          const event = events.find(
            (item) => item.id === id,
          );

          if (!event) {
            toast.error("Evento non trovato");
            return;
          }

          setDetailOpen(false);
          setDetailEvent(null);
          setEditEvent(event);
          setEditOpen(true);
        }}
        onViewParticipants={(id) => {
          const event = events.find(
            (item) => item.id === id,
          );

          if (!event) {
            toast.error("Evento non trovato");
            return;
          }

          setDetailOpen(false);
          setDetailEvent(null);
          setParticipantsEvent(event);
          setParticipantsOpen(true);
        }}
        onDelete={(id) => {
          setDetailOpen(false);
          setDetailEvent(null);
          void deleteEvent(id);
        }}
        registrationLoading={
          detailEvent
            ? registrationLoadingId === detailEvent.id
            : false
        }
        canManageEvents={canManageEvents}
      />

      <EventParticipantsModal
        open={participantsOpen}
        eventId={participantsEvent?.id ?? null}
        eventTitle={participantsEvent?.title}
        onClose={() => {
          setParticipantsOpen(false);
          setParticipantsEvent(null);
        }}
      />

      <CreateEventModal
        open={createOpen}
        associationId={associationId}
        onClose={() => {
          setCreateOpen(false);
        }}
        onCreated={async () => {
          setCreateOpen(false);
          await loadEvents();
        }}
      />

      <EditEventModal
        open={editOpen}
        event={editEvent}
        associationId={associationId}
        onClose={() => {
          setEditOpen(false);
          setEditEvent(null);
        }}
        onUpdated={async () => {
          setEditOpen(false);
          setEditEvent(null);
          await loadEvents();
        }}
      />
    </div>
  );
}


















