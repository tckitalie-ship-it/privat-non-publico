'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPin, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { getAccessToken } from '@/lib/api';
import DashboardSidebar from '@/components/dashboard-sidebar';

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  registrationsCount?: number;
  isRegistered?: boolean;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [search, setSearch] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  async function loadEvents() {
    try {
      setLoadingEvents(true);
      const token = getAccessToken();

      const res = await fetch('/api/events', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) throw new Error('Errore caricamento eventi');

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

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleCreateEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      const token = getAccessToken();

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          description,
          location,
          startsAt,
          endsAt: endsAt || undefined,
        }),
      });

      if (!res.ok) throw new Error('Errore creazione evento');

      setTitle('');
      setDescription('');
      setLocation('');
      setStartsAt('');
      setEndsAt('');
      setShowForm(false);

      await loadEvents();
      toast.success('Evento creato');
    } catch (error) {
      console.error(error);
      toast.error('Errore creazione evento');
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id: string) {
    try {
      const token = getAccessToken();

      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) throw new Error('Errore eliminazione evento');

      await loadEvents();
      toast.success('Evento eliminato');
    } catch (error) {
      console.error(error);
      toast.error('Errore eliminazione evento');
    }
  }

  async function registerToEvent(id: string) {
    try {
      const token = getAccessToken();

      const res = await fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) throw new Error('Errore registrazione evento');

      await loadEvents();
      toast.success('Partecipazione registrata');
    } catch (error) {
      console.error(error);
      toast.error('Errore registrazione evento');
    }
  }

  async function unregisterFromEvent(id: string) {
    try {
      const token = getAccessToken();

      const res = await fetch(`/api/events/${id}/register`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) throw new Error('Errore annullamento partecipazione');

      await loadEvents();
      toast.success('Partecipazione annullata');
    } catch (error) {
      console.error(error);
      toast.error('Errore annullamento partecipazione');
    }
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      return (
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        (event.description || '').toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [events, search]);

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold">Eventi</h1>
                <p className="mt-3 text-zinc-400">
                  Gestisci gli eventi della tua associazione.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm((value) => !value)}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                <Plus className="h-5 w-5" />
                Nuovo evento
              </button>
            </div>
          </section>

          {showForm && (
            <form
              onSubmit={handleCreateEvent}
              className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titolo evento"
                  required
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3"
                />

                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Luogo"
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3"
                />

                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3"
                />

                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3"
                />
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrizione"
                rows={4}
                className="mt-5 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3"
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-5 rounded-2xl bg-white px-5 py-3 font-semibold text-zinc-950"
              >
                {loading ? 'Creazione...' : 'Salva evento'}
              </button>
            </form>
          )}

          <section className="mt-8">
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111827] px-4">
              <Search className="h-5 w-5 text-zinc-500" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca evento..."
                className="w-full bg-transparent py-3 outline-none"
              />
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
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-3xl border border-white/10 bg-[#111827] p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-5 w-5 text-indigo-300" />
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
                        className="rounded-xl border border-red-500/20 p-2 text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <MapPin className="h-4 w-4 text-cyan-300" />
                        {event.location || 'Luogo non specificato'}
                      </div>

                      <div className="text-sm text-zinc-400">
                        {event.startsAt
                          ? new Date(event.startsAt).toLocaleString('it-IT')
                          : 'Data non definita'}
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
                        <p className="text-sm text-zinc-400">Partecipanti</p>
                        <h3 className="mt-2 text-3xl font-bold text-white">
                          {event.registrationsCount || 0}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          event.isRegistered
                            ? unregisterFromEvent(event.id)
                            : registerToEvent(event.id)
                        }
                        className={
                          event.isRegistered
                            ? 'w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20'
                            : 'w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500'
                        }
                      >
                        {event.isRegistered
                          ? 'Annulla partecipazione'
                          : 'Partecipa'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}