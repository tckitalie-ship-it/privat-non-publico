'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const API_URL = 'http://localhost:3000/api';

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt?: string | null;
  createdAt?: string;
};

const menu = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Search', href: '/search' },
  { label: 'Assistant', href: '/assistant' },
  { label: 'Chat', href: '/chat' },
  { label: 'Notifications', href: '/notifications' },
  { label: 'Eventi', href: '/events' },
  { label: 'Membri', href: '/members' },
  { label: 'Files', href: '/files' },
  { label: 'Associations', href: '/associations' },
  { label: 'Finanze', href: '/finance' },
  { label: 'Billing', href: '/billing' },
  { label: 'Settings', href: '/settings' },
];

function getToken() {
  if (typeof window === 'undefined') return '';

  const localToken = localStorage.getItem('access_token');
  if (localToken) return localToken;

  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === 'access_token') return decodeURIComponent(value);
  }

  return '';
}

function toInputDate(value?: string) {
  const date = value ? new Date(value) : new Date();

  const pad = (n: number) => String(n).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const [startsAt, setStartsAt] = useState(toInputDate());
  const [endsAt, setEndsAt] = useState(
    toInputDate(new Date(Date.now() + 60 * 60 * 1000).toISOString()),
  );

  async function loadEvents() {
    try {
      setLoading(true);
      setError('');

      const token = getToken();

      if (!token) {
        throw new Error('Token mancante. Fai login di nuovo.');
      }

      const res = await fetch(`${API_URL}/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Errore caricamento eventi');
      }

      setEvents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const token = getToken();

      if (!token) {
        throw new Error('Token mancante. Fai login di nuovo.');
      }

      if (!title.trim()) {
        throw new Error('Titolo obbligatorio.');
      }

      const start = new Date(startsAt);
      const end = new Date(endsAt);

      if (Number.isNaN(start.getTime())) {
        throw new Error('Data inizio non valida.');
      }

      if (Number.isNaN(end.getTime())) {
        throw new Error('Data fine non valida.');
      }

      if (end <= start) {
        throw new Error('La data fine deve essere dopo la data inizio.');
      }

      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          location: location.trim(),
          description: description.trim(),
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Errore creazione evento');
      }

      setTitle('');
      setLocation('');
      setDescription('');
      setStartsAt(toInputDate());
      setEndsAt(toInputDate(new Date(Date.now() + 60 * 60 * 1000).toISOString()));
      setSuccess('Evento salvato correttamente.');

      await loadEvents();
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(eventId: string) {
    try {
      setError('');
      setSuccess('');

      const token = getToken();

      if (!token) {
        throw new Error('Token mancante. Fai login di nuovo.');
      }

      const res = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Errore eliminazione evento');
      }

      setSuccess('Evento eliminato.');
      await loadEvents();
    } catch (err: any) {
      setError(String(err?.message || err));
    }
  }

  const filteredEvents = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return events;

    return events.filter((event) => {
      return (
        event.title?.toLowerCase().includes(value) ||
        event.location?.toLowerCase().includes(value) ||
        event.description?.toLowerCase().includes(value)
      );
    });
  }, [events, search]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-72 shrink-0 border-r bg-slate-950 text-white lg:block">
        <div className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-xl font-bold text-white">
            AS
          </div>

          <h2 className="mt-4 text-lg font-bold">Association SaaS</h2>
          <p className="text-sm text-slate-400">Premium workspace</p>
        </div>

        <nav className="space-y-1 px-4 pb-6">
          <p className="px-3 pb-2 text-xs font-semibold uppercase text-slate-500">
            Main
          </p>

          {menu.map((item) => {
            const active = item.href === '/events';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? 'block rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-white'
                    : 'block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <p className="font-semibold">Sistema realtime attivo</p>
          <p className="mt-1 text-emerald-300">Websocket live online</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <Link href="/dashboard" className="text-sm text-slate-300">
                  ← Dashboard
                </Link>

                <h1 className="mt-3 text-5xl font-black">Eventi</h1>

                <p className="mt-2 text-sm text-slate-300">
                  Gestisci eventi, calendario, ricerca e lista eventi reali.
                </p>
              </div>

              <button
                type="button"
                onClick={loadEvents}
                className="rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-bold text-white hover:bg-cyan-600"
              >
                Aggiorna eventi
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
              {success}
            </div>
          )}

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Nuovo evento
                </h2>
                <p className="text-sm text-slate-500">
                  Compila il calendario e salva l’evento nel database.
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">
                Calendario visibile
              </div>
            </div>

            <form onSubmit={handleCreateEvent} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Titolo evento"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <input
                  className="rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Luogo"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="rounded-2xl border-2 border-cyan-400 bg-cyan-50 p-4">
                  <span className="mb-2 block text-sm font-black text-cyan-700">
                    📅 Inizio evento
                  </span>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl border bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    required
                  />
                </label>

                <label className="rounded-2xl border-2 border-violet-400 bg-violet-50 p-4">
                  <span className="mb-2 block text-sm font-black text-violet-700">
                    📅 Fine evento
                  </span>
                  <input
                    type="datetime-local"
                    className="w-full rounded-xl border bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-violet-500"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    required
                  />
                </label>
              </div>

              <textarea
                className="min-h-[140px] rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Descrizione evento"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {saving ? 'Salvataggio...' : 'Salva evento'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTitle('');
                    setLocation('');
                    setDescription('');
                    setStartsAt(toInputDate());
                    setEndsAt(
                      toInputDate(
                        new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                      ),
                    );
                  }}
                  className="rounded-xl border px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  Pulisci form
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <input
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Cerca evento per titolo, luogo o descrizione..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </section>

          <section className="rounded-3xl border bg-white shadow-sm">
            <div className="border-b p-6">
              <h2 className="text-2xl font-black text-slate-900">
                Lista eventi
              </h2>
              <p className="text-sm text-slate-500">
                Eventi salvati nel backend.
              </p>
            </div>

            {loading ? (
              <div className="p-6 text-sm text-slate-500">
                Caricamento eventi...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                Nessun evento trovato.
              </div>
            ) : (
              <div className="divide-y">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h3 className="text-xl font-black text-slate-900">
                        {event.title}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        {event.location || 'Luogo non specificato'}
                      </p>

                      {event.description && (
                        <p className="mt-2 text-sm text-slate-700">
                          {event.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold">
                        <span className="rounded-full bg-cyan-50 px-3 py-2 text-cyan-700">
                          Inizio:{' '}
                          {new Date(event.startsAt).toLocaleString('it-IT')}
                        </span>

                        <span className="rounded-full bg-violet-50 px-3 py-2 text-violet-700">
                          Fine:{' '}
                          {event.endsAt
                            ? new Date(event.endsAt).toLocaleString('it-IT')
                            : '-'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(event.id)}
                      className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                    >
                      Elimina
                    </button>
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