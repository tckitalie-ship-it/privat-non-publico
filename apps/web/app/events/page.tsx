'use client';

import Link from 'next/link';

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  CalendarDays,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';

import { toast } from 'sonner';

import DashboardSidebar from '@/components/dashboard-sidebar';

const API_URL = 'http://localhost:3000/api';

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
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING'>('ALL');

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
    } catch (error) {
      console.error(error);
      toast.error('Errore caricamento eventi');
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
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Errore creazione evento');
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id: string) {
    try {
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

      toast.success('Evento eliminato');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Errore eliminazione evento');
    }
  }

  async function registerToEvent(eventId: string) {
    try {
      const token = getAccessToken();
      const userId = getUserIdFromToken(token);

      if (!token || !userId) {
        throw new Error('Utente non autenticato');
      }

      const res = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Errore registrazione');
      }

      await loadEvents();

      toast.success('Registrazione completata');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Errore registrazione');
    }
  }

  async function unregisterFromEvent(eventId: string) {
    try {
      const token = getAccessToken();
      const userId = getUserIdFromToken(token);

      if (!token || !userId) {
        throw new Error('Utente non autenticato');
      }

      const res = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || 'Errore annullamento');
      }

      await loadEvents();

      toast.success('Partecipazione annullata');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Errore annullamento');
    }
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const value = search.toLowerCase();

      const matchesSearch =
        event.title?.toLowerCase().includes(value) ||
        (event.description || '').toLowerCase().includes(value) ||
        (event.location || '').toLowerCase().includes(value);

      const matchesFilter =
        filter === 'ALL'
          ? true
          : new Date(event.startsAt || '') >= new Date();

      return matchesSearch && matchesFilter;
    });
  }, [events, search, filter]);

  const currentUserId = getUserIdFromToken(getAccessToken());

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 px-6 py-8 md:ml-72">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
            >
              ← Dashboard
            </Link>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-[#111827] p-8 shadow-2xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-5xl font-bold">Eventi</h1>

                <p className="mt-3 text-zinc-400">
                  Gestisci eventi, calendario, partecipazioni e notifiche
                  realtime.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  <Plus className="h-5 w-5" />
                  Nuovo evento
                </button>

                <button
                  type="button"
                  onClick={loadEvents}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <RefreshCw className="h-5 w-5" />
                  Aggiorna
                </button>
              </div>
            </div>
          </section>

          {showForm && (
            <form
              onSubmit={handleCreateEvent}
              className="mt-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 p-6"
            >
              <div className="mb-6 flex items-center gap-3">
                <CalendarDays className="h-7 w-7 text-cyan-300" />

                <div>
                  <h2 className="text-2xl font-bold">Nuovo evento</h2>

                  <p className="text-sm text-zinc-400">
                    Calendario avanzato pronto per future notifiche realtime.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titolo evento"
                  required
                  className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] px-4 py-3 outline-none transition focus:border-cyan-400"
                />

                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Luogo"
                  className="rounded-2xl border border-cyan-500/20 bg-[#0b1220] px-4 py-3 outline-none transition focus:border-cyan-400"
                />

                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-cyan-300">
                    Inizio evento
                  </p>

                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    required
                    className="w-full rounded-xl border border-cyan-500/20 bg-[#0b1220] px-4 py-3"
                  />
                </div>

                <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-violet-300">
                    Fine evento
                  </p>

                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full rounded-xl border border-violet-500/20 bg-[#0b1220] px-4 py-3"
                  />
                </div>
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrizione evento"
                rows={4}
                className="mt-5 w-full rounded-2xl border border-cyan-500/20 bg-[#0b1220] px-4 py-3"
              />

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-50"
                >
                  {loading ? 'Creazione...' : 'Salva evento'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-2xl border border-white/10 px-6 py-3 font-semibold text-white hover:bg-white/5"
                >
                  Chiudi
                </button>
              </div>
            </form>
          )}

          <section className="mt-8">
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111827] p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1220] px-4">
                <Search className="h-5 w-5 text-zinc-500" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cerca evento..."
                  className="w-full bg-transparent py-3 outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFilter('ALL')}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                    filter === 'ALL'
                      ? 'bg-white text-black'
                      : 'border border-white/10 bg-white/5 text-white'
                  }`}
                >
                  Tutti
                </button>

                <button
                  type="button"
                  onClick={() => setFilter('UPCOMING')}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                    filter === 'UPCOMING'
                      ? 'bg-cyan-400 text-black'
                      : 'border border-white/10 bg-white/5 text-white'
                  }`}
                >
                  Futuri
                </button>
              </div>
            </div>

            {loadingEvents ? (
              <div className="rounded-3xl border border-white/10 bg-[#111827] p-10 text-center text-zinc-400">
                Caricamento eventi...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-[#111827] p-10 text-center text-zinc-500">
                Nessun evento trovato.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.map((event) => {
                  const isRegistered = event.registrations?.some(
                    (registration) =>
                      registration.user?.id === currentUserId,
                  );

                  return (
                    <div
                      key={event.id}
                      className="rounded-3xl border border-cyan-500/10 bg-[#111827] p-6 shadow-xl transition hover:border-cyan-400/30"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-cyan-300" />

                            <h3 className="text-xl font-semibold">
                              {event.title}
                            </h3>
                          </div>

                          <p className="mt-3 text-sm text-zinc-400">
                            {event.description || 'Nessuna descrizione'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteEvent(event.id)}
                          className="rounded-xl border border-red-500/20 p-2 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <MapPin className="h-4 w-4 text-cyan-300" />

                          {event.location || 'Luogo non specificato'}
                        </div>

                        <div className="rounded-2xl border border-cyan-500/10 bg-cyan-500/5 p-3 text-sm text-cyan-100">
                          {event.startsAt
                            ? new Date(event.startsAt).toLocaleString('it-IT')
                            : 'Data non definita'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          isRegistered
                            ? unregisterFromEvent(event.id)
                            : registerToEvent(event.id)
                        }
                        className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                          isRegistered
                            ? 'border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20'
                            : 'bg-cyan-500 text-black hover:bg-cyan-400'
                        }`}
                      >
                        {isRegistered ? 'Annulla partecipazione' : 'Partecipa'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}