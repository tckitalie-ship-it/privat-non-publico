"use client";

import Link from 'next/link';

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  CalendarDays,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';

import { toast } from 'sonner';

import DashboardSidebar from '@/components/dashboard-sidebar';
import { API_URL } from '@/lib/api';

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

function getAccessToken() {
  if (typeof window === 'undefined') return null;

  const localToken = localStorage.getItem('access_token');

  if (localToken) return localToken;

  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');

    if (key === 'access_token') {
      return decodeURIComponent(value);
    }
  }

  return null;
}

function getUserIdFromToken(token: string | null) {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [, setLoading] = useState(false);
  const [, setLoadingEvents] = useState(true);
  const [search] = useState('');
  const [filter] = useState<'ALL' | 'UPCOMING'>('ALL');
  const [confirmDeleteEvent, setConfirmDeleteEvent] =
    useState<EventItem | null>(null);
  const [deletingEvent, setDeletingEvent] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoadingEvents(true);

      const token = getAccessToken();

      const res = await fetch(`${API_URL}/events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error('Errore caricamento eventi');
      }

      const data = await res.json();

      setEvents(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Errore caricamento eventi';
      console.error(error);
      toast.error(message);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }

  async function handleCreateEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);

      const token = getAccessToken();

      if (!token) {
        throw new Error('Login richiesto');
      }

      if (!title.trim()) {
        throw new Error('Titolo obbligatorio');
      }

      if (!startsAt) {
        throw new Error('Data inizio obbligatoria');
      }

      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          startsAt: new Date(startsAt).toISOString(),
          endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Errore creazione evento');
      }

      setTitle('');
      setDescription('');
      setLocation('');
      setStartsAt('');
      setEndsAt('');
      setShowForm(false);

      await loadEvents();

      toast.success('Evento creato');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Errore creazione evento';
      console.error(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id: string) {
    try {
      setDeletingEvent(true);

      const token = getAccessToken();

      if (!token) {
        throw new Error('Login richiesto');
      }

      const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Errore eliminazione evento');
      }

      await loadEvents();
      setConfirmDeleteEvent(null);

      toast.success('Evento eliminato');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Errore eliminazione evento';
      console.error(error);
      toast.error(message);
    } finally {
      setDeletingEvent(false);
    }
  }

  async function registerToEvent(eventId: string) {
    try {
      const token = getAccessToken();
      const userId = getUserIdFromToken(token);

      if (!token || !userId) {
        throw new Error('Login richiesto');
      }

      const res = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Errore registrazione evento');
      }

      await loadEvents();

      toast.success('Registrazione completata');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Errore registrazione evento';
      console.error(error);
      toast.error(message);
    }
  }

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch =
        ev.title.toLowerCase().includes(search.toLowerCase()) ||
        ev.description?.toLowerCase().includes(search.toLowerCase());

      const isUpcoming =
        filter === 'UPCOMING'
          ? ev.startsAt && new Date(ev.startsAt) > new Date()
          : true;

      return matchesSearch && isUpcoming;
    });
  }, [events, search, filter]);

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 p-8 md:ml-72">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
            >
              ← Dashboard
            </Link>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-400">
                Workspace
              </p>

              <h1 className="mt-2 text-5xl font-bold">
                Eventi
              </h1>

              <p className="mt-3 max-w-2xl text-gray-400">
                Gestisci gli eventi, le registrazioni e le attività principali
                della piattaforma.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm((value) => !value)}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500"
            >
              <Plus size={18} />
              {showForm ? 'Chiudi' : 'Nuovo evento'}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleCreateEvent}
              className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-2xl"
            >
              <h2 className="text-2xl font-bold">
                Crea evento
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titolo evento"
                  required
                  className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-4 text-white outline-none focus:border-indigo-500"
                />

                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Luogo"
                  className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-4 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                  className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-4 text-white outline-none focus:border-indigo-500"
                />

                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-4 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrizione"
                className="mt-6 w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-4 text-white outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                className="mt-5 rounded-2xl bg-white px-5 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Salva evento
              </button>
            </form>
          )}

          <section className="grid gap-5">
            {filteredEvents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-[#1a1f2e] p-12 text-center text-gray-400">
                Nessun evento trovato.
              </div>
            ) : (
              filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {ev.title}
                      </h2>

                      <p className="mt-2 text-gray-400">
                        {ev.description}
                      </p>

                      <div className="mt-4 flex items-center gap-3 text-sm text-gray-400">
                        <CalendarDays size={16} />
                        {ev.startsAt
                          ? new Date(ev.startsAt).toLocaleString('it-IT')
                          : 'Data non disponibile'}
                      </div>

                      {ev.location && (
                        <div className="mt-2 flex items-center gap-3 text-sm text-gray-400">
                          <MapPin size={16} />
                          {ev.location}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setConfirmDeleteEvent(ev)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                      Elimina
                    </button>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => registerToEvent(ev.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 px-4 py-2 text-sm text-indigo-300 transition hover:bg-indigo-500/10"
                    >
                      <Plus size={16} />
                      Registrati
                    </button>

                    <Link
                      href={`/events/${ev.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
                    >
                      <Search size={16} />
                      Dettagli
                    </Link>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>

      {confirmDeleteEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-event-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
            <h2
              id="delete-event-title"
              className="text-lg font-semibold text-white"
            >
              Eliminare l&apos;evento?
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Stai per eliminare l&apos;evento{' '}
              <span className="font-medium text-white">
                {confirmDeleteEvent.title}
              </span>
              . Questa operazione non può essere annullata.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteEvent(null)}
                disabled={deletingEvent}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
              >
                Annulla
              </button>

              <button
                type="button"
                onClick={() => void deleteEvent(confirmDeleteEvent.id)}
                disabled={deletingEvent}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingEvent && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Conferma eliminazione
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}