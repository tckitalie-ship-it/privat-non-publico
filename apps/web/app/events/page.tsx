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
  Search,
  Trash2,
} from 'lucide-react';

import DashboardSidebar from '@/components/dashboard-sidebar';

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
};

const STORAGE_KEY = 'demo-events';

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING'>('ALL');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch {
        setEvents([]);
      }
    }
  }, []);

  function saveEvents(updated: EventItem[]) {
    setEvents(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  async function handleCreateEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);

      const demoEvent: EventItem = {
        id: crypto.randomUUID(),
        title,
        description,
        location,
        startsAt,
        endsAt,
      };

      saveEvents([demoEvent, ...events]);

      setTitle('');
      setDescription('');
      setLocation('');
      setStartsAt('');
      setEndsAt('');
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  }

  function deleteEvent(id: string) {
    const updated = events.filter((event) => event.id !== id);
    saveEvents(updated);
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        (event.description || '').toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === 'ALL'
          ? true
          : new Date(event.startsAt || '') >= new Date();

      return matchesSearch && matchesFilter;
    });
  }, [events, search, filter]);

  const upcomingEvents = events.filter((event) => {
    if (!event.startsAt) return false;
    return new Date(event.startsAt) >= new Date();
  });

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

          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827] p-8 shadow-2xl">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="mb-3 inline-flex rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
                  Gestione eventi
                </p>

                <h1 className="text-5xl font-bold">Eventi</h1>

                <p className="mt-3 max-w-2xl text-zinc-400">
                  Crea, monitora e organizza gli eventi della tua associazione.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm((value) => !value)}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                <Plus className="h-5 w-5" />
                {showForm ? 'Chiudi' : 'Nuovo evento'}
              </button>
            </div>
          </section>

          {showForm ? (
            <form
              onSubmit={handleCreateEvent}
              className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl"
            >
              <h2 className="text-2xl font-semibold">Crea evento</h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titolo evento"
                  required
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white outline-none focus:border-indigo-500"
                />

                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Luogo"
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white outline-none focus:border-indigo-500"
                />

                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white outline-none focus:border-indigo-500"
                />

                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrizione"
                rows={4}
                className="mt-5 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-white outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-5 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
              >
                {loading ? 'Creazione...' : 'Salva evento'}
              </button>
            </form>
          ) : null}

          <section className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <p className="text-sm text-indigo-300">Eventi totali</p>
              <h2 className="mt-4 text-4xl font-bold">{events.length}</h2>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <p className="text-sm text-emerald-300">Prossimi eventi</p>
              <h2 className="mt-4 text-4xl font-bold">{upcomingEvents.length}</h2>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <p className="text-sm text-cyan-300">Registrazioni</p>
              <h2 className="mt-4 text-4xl font-bold">0</h2>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-2xl">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Lista eventi</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Eventi demo persistenti
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111827] px-4">
                  <Search className="h-5 w-5 text-zinc-500" />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cerca evento..."
                    className="bg-transparent py-3 outline-none"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value as 'ALL' | 'UPCOMING')
                  }
                  className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
                >
                  <option value="ALL">Tutti gli eventi</option>
                  <option value="UPCOMING">Prossimi eventi</option>
                </select>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#111827]">
              <div className="grid grid-cols-7 border-b border-white/10 text-center text-sm font-semibold text-zinc-400">
                {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
                  <div
                    key={day}
                    className="border-r border-white/5 p-4 last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {Array.from({ length: 35 }).map((_, index) => {
                  const day = index + 1;

                  const dayEvents = events.filter((event) => {
                    if (!event.startsAt) return false;

                    return new Date(event.startsAt).getDate() === day;
                  });

                  const hasEvent = dayEvents.length > 0;

                  return (
                    <div
                      key={day}
                      className={`min-h-[110px] border-b border-r border-white/5 p-3 transition ${
                        hasEvent ? 'bg-indigo-600/10' : 'bg-[#111827]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold ${
                            hasEvent ? 'text-indigo-300' : 'text-zinc-500'
                          }`}
                        >
                          {day}
                        </span>

                        {hasEvent && (
                          <div className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                        )}
                      </div>

                      <div className="mt-3 space-y-2">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className="truncate rounded-lg bg-indigo-600 px-2 py-1 text-xs font-medium text-white"
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-black/20 p-12 text-center">
                <h3 className="text-2xl font-semibold">
                  Nessun evento trovato
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
                  Crea il primo evento della tua associazione.
                </p>

                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                >
                  Crea primo evento
                </button>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl transition hover:border-indigo-500/30"
                  >
                    <div className="flex items-start justify-between gap-4">
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
                        className="rounded-xl border border-red-500/20 p-2 text-red-300 transition hover:bg-red-500/10"
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
                        <span className="font-medium text-white">Inizio:</span>{' '}
                        {event.startsAt
                          ? new Date(event.startsAt).toLocaleString('it-IT')
                          : 'Non specificato'}
                      </div>

                      <div className="text-sm text-zinc-400">
                        <span className="font-medium text-white">Fine:</span>{' '}
                        {event.endsAt
                          ? new Date(event.endsAt).toLocaleString('it-IT')
                          : 'Non specificato'}
                      </div>
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