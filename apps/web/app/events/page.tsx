"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { toast } from "sonner";

import DashboardSidebar from "@/components/dashboard-sidebar";
import { getAccessToken } from "@/lib/api";
import { getActiveAssociationId } from "@/lib/association";

type Role = "OWNER" | "ADMIN" | "MEMBER";

type EventRegistration = {
  id: string;
  user?: {
    id: string;
    email: string;
  };
};

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  registrations?: EventRegistration[];
};

function getUserIdFromToken(
  token: string | null,
): string | null {
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1]),
    ) as {
      sub?: string;
    };

    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [, setLoading] = useState(false);
  const [, setLoadingEvents] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<"ALL" | "UPCOMING" | "PAST">("ALL");

  const [confirmDeleteEvent, setConfirmDeleteEvent] =
    useState<EventItem | null>(null);

  const [registeringEvent, setRegisteringEvent] =
    useState<string | null>(null);

  const [deletingEvent, setDeletingEvent] =
    useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [currentUserRole, setCurrentUserRole] =
    useState<Role | null>(null);

  const associationId =
    getActiveAssociationId();

  useEffect(() => {
    const token = getAccessToken();

    setCurrentUserId(
      getUserIdFromToken(token),
    );

    void loadEvents();
  }, []);

  useEffect(() => {
    const loadCurrentMembership = async () => {
      const token = getAccessToken();
      const activeAssociationId =
        getActiveAssociationId();

      if (!token) {
        setCurrentUserRole(null);
        return;
      }

      try {
        const response = await fetch(
          "/api/memberships/me",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
              "x-association-id":
                activeAssociationId ?? "",
            },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          setCurrentUserRole(null);
          return;
        }

        const data =
          await response.json().catch(
            () => null,
          );

        setCurrentUserRole(
          data?.role ??
            data?.membership?.role ??
            null,
        );
      } catch (error) {
        console.error(
          "Errore caricamento ruolo:",
          error,
        );

        setCurrentUserRole(null);
      }
    };

    void loadCurrentMembership();
  }, []);

  const canManageEvents =
    currentUserRole === "OWNER" ||
    currentUserRole === "ADMIN";

  async function loadEvents() {
    try {
      setLoadingEvents(true);

      const token = getAccessToken();

      if (!token) {
        setEvents([]);
        return;
      }

      const activeAssociationId =
        getActiveAssociationId();

      const res = await fetch(
        "/api/events",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "x-association-id":
              activeAssociationId ?? "",
          },
          cache: "no-store",
        },
      );

      if (!res.ok) {
        const data =
          await res.json().catch(
            () => null,
          );

        throw new Error(
          data?.message ||
            "Errore caricamento eventi",
        );
      }

      const data = await res.json();

      setEvents(
        Array.isArray(data)
          ? data
          : data?.events && Array.isArray(data.events)
            ? data.events
            : [],
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Errore caricamento eventi";

      console.error(error);
      toast.error(message);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }

  async function handleCreateEvent(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!canManageEvents) {
      toast.error(
        "Non hai i permessi per creare eventi",
      );
      return;
    }

    const token = getAccessToken();
    const activeAssociationId =
      getActiveAssociationId();

    if (!token) {
      toast.error("Sessione non disponibile");
      return;
    }

    if (!title.trim()) {
      toast.error("Inserisci il titolo dell'evento");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/events",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
            "x-association-id":
              activeAssociationId ?? "",
          },
          body: JSON.stringify({
            title: title.trim(),
            description:
              description.trim() || undefined,
            location:
              location.trim() || undefined,
            startsAt:
              startsAt || undefined,
            endsAt:
              endsAt || undefined,
          }),
        },
      );

      const data =
        await response.json().catch(
          () => null,
        );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Errore creazione evento",
        );
      }

      toast.success("Evento creato");

      setTitle("");
      setDescription("");
      setLocation("");
      setStartsAt("");
      setEndsAt("");
      setShowForm(false);

      await loadEvents();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Errore creazione evento";

      console.error(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }


  async function handleRegisterEvent(event: EventItem) {
    const token = getAccessToken();
    const activeAssociationId =
      getActiveAssociationId();

    if (!token) {
      toast.error("Sessione non disponibile");
      return;
    }

    try {
      setRegisteringEvent(event.id);

      const response = await fetch(
        `/api/events/${event.id}/register`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "x-association-id":
              activeAssociationId ?? "",
          },
        },
      );

      const data =
        await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Errore registrazione evento",
        );
      }

      toast.success("Registrazione effettuata");

      await loadEvents();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Errore registrazione evento";

      console.error(error);
      toast.error(message);
    } finally {
      setRegisteringEvent(null);
    }
  }
  async function handleDeleteEvent(
    event: EventItem,
  ) {
    if (!canManageEvents) {
      toast.error(
        "Non hai i permessi per eliminare eventi",
      );
      return;
    }

    const token = getAccessToken();
    const activeAssociationId =
      getActiveAssociationId();

    if (!token) {
      toast.error("Sessione non disponibile");
      return;
    }

    try {
      setDeletingEvent(true);

      const response = await fetch(
        `/api/events/${event.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "x-association-id":
              activeAssociationId ?? "",
          },
        },
      );

      const data =
        await response.json().catch(
          () => null,
        );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Errore eliminazione evento",
        );
      }

      toast.success("Evento eliminato");

      setConfirmDeleteEvent(null);

      await loadEvents();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Errore eliminazione evento";

      console.error(error);
      toast.error(message);
    } finally {
      setDeletingEvent(false);
    }
  }

  const filteredEvents = useMemo(() => {
    const now = new Date();

    return events.filter((event) => {
      const matchesSearch =
        event.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        event.description
          ?.toLowerCase()
          .includes(search.toLowerCase());

      if (!matchesSearch) {
        return false;
      }

      if (filter === "UPCOMING") {
        if (!event.startsAt) {
          return false;
        }

        return new Date(event.startsAt) >= now;
      }

      if (filter === "PAST") {
        if (!event.startsAt) {
          return false;
        }

        return new Date(event.startsAt) < now;
      }

      return true;
    });
  }, [events, search, filter]);

  const upcomingEvents =
    events.filter((event) => {
      if (!event.startsAt) {
        return false;
      }

      return (
        new Date(event.startsAt) >=
        new Date()
      );
    });

  const totalParticipants =
    events.reduce(
      (total, event) =>
        total +
        (event.registrations?.length ?? 0),
      0,
    );

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <DashboardSidebar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <CalendarDays className="h-8 w-8 text-blue-400" />

              <div>
                <h1 className="text-3xl font-bold">
                  Gestione Eventi
                </h1>

                <p className="mt-2 text-gray-400">
                  Organizza, pianifica e monitora
                  tutti gli eventi della tua
                  associazione.
                </p>
              </div>
            </div>

            {!associationId && (
              <p className="text-sm text-amber-400">
                Nessuna associazione attiva selezionata.
                Vai in Associazioni e apri
                un'associazione.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setShowForm(!showForm)
            }
            disabled={
              !canManageEvents ||
              !associationId
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />

            {showForm
              ? "Chiudi"
              : "Nuovo evento"}
          </button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-400">
              Eventi totali
            </p>

            <p className="mt-2 text-3xl font-bold">
              {events.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-400">
              Prossimi eventi
            </p>

            <p className="mt-2 text-3xl font-bold">
              {upcomingEvents.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-400">
              Partecipanti
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalParticipants}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-400">
              Location
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                new Set(
                  events
                    .map(
                      (event) =>
                        event.location,
                    )
                    .filter(Boolean),
                ).size
              }
            </p>
          </div>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreateEvent}
            className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="mb-6 text-xl font-semibold">
              Nuovo evento
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Titolo
                </label>

                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-blue-500"
                  placeholder="Titolo evento"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Location
                </label>

                <input
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-blue-500"
                  placeholder="Luogo evento"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Data inizio
                </label>

                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) =>
                    setStartsAt(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Data fine
                </label>

                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) =>
                    setEndsAt(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-gray-300">
                Descrizione
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-blue-500"
                placeholder="Descrizione dell'evento"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500"
              >
                Crea evento
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="rounded-xl border border-white/10 px-5 py-3 hover:bg-white/5"
              >
                Annulla
              </button>
            </div>
          </form>
        )}

        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Cerca evento..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filter}
            onChange={(e) =>
              setFilter(
                e.target.value as
                  | "ALL"
                  | "UPCOMING"
                  | "PAST",
              )
            }
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          >
            <option value="ALL">
              Tutti
            </option>

            <option value="UPCOMING">
              Prossimi
            </option>

            <option value="PAST">
              Passati
            </option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-gray-400">
              Nessun evento programmato.
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {event.title}
                    </h2>

                    {event.description && (
                      <p className="mt-2 text-gray-400">
                        {event.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
                      {event.location && (
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </span>
                      )}

                      {event.startsAt && (
                        <span>
                          {new Date(
                            event.startsAt,
                          ).toLocaleString(
                            "it-IT",
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleRegisterEvent(event)
                      }
                      disabled={
                        registeringEvent === event.id
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {registeringEvent === event.id
                        ? "Registrazione..."
                        : "Partecipa"}
                    </button>

                    {canManageEvents && (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDeleteEvent(
                            event,
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Elimina
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {confirmDeleteEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-6">
              <h2 className="text-xl font-semibold">
                Eliminare evento?
              </h2>

              <p className="mt-3 text-gray-400">
                Stai per eliminare "
                {confirmDeleteEvent.title}".
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={deletingEvent}
                  onClick={() =>
                    handleDeleteEvent(
                      confirmDeleteEvent,
                    )
                  }
                  className="rounded-xl bg-red-600 px-5 py-3 font-medium hover:bg-red-500 disabled:opacity-50"
                >
                  {deletingEvent
                    ? "Eliminazione..."
                    : "Elimina"}
                </button>

                <button
                  type="button"
                  disabled={deletingEvent}
                  onClick={() =>
                    setConfirmDeleteEvent(null)
                  }
                  className="rounded-xl border border-white/10 px-5 py-3 hover:bg-white/5"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10">
          <Link
            href="/dashboard"
            className="text-sm text-gray-400 hover:text-white"
          >
            ← Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

