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

  const currentUserId =
    getCurrentUserId();

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
          registrations.length,
        isRegistered:
          Boolean(currentUserId) &&
          registrations.some(
            (registration) =>
              registration.userId ===
              currentUserId,
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
          ? event.registrations.length
          : 0),
      0,
    );

  return (
    <div className="min-w-0 space-y-8">
      <EventsHeader
        eventsCount={events.length}
        upcomingCount={
          upcomingEvents
        }
        onCreate={() => {
          setCreateOpen(true);
        }}
      />

      <EventsStats
        totalEvents={events.length}
        upcomingEvents={
          upcomingEvents
        }
        participants={
          totalParticipants
        }
        locations={locationsCount}
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
      />

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