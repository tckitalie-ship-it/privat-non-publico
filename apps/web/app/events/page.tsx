'use client';

import { io } from 'socket.io-client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { API_URL, getAccessToken } from '@/lib/api';
import DashboardSidebar from '@/components/dashboard-sidebar';

type EventItem = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt?: string;
  registrationsCount: number;
  isRegistered: boolean;
};

const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [creating, setCreating] = useState(false);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const days: Date[] = [];

    for (let i = startOffset; i > 0; i--) {
      days.push(new Date(year, month, 1 - i));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    while (days.length % 7 !== 0) {
      days.push(new Date(year, month, days.length - startOffset + 1));
    }

    return days;
  }, [currentDate]);

  function isSameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function getEventsForDay(day: Date) {
    return events.filter((event) => isSameDay(new Date(event.startsAt), day));
  }

  function moveDateKeepingTime(originalDate: string, targetDay: Date) {
    const original = new Date(originalDate);

    return new Date(
      targetDay.getFullYear(),
      targetDay.getMonth(),
      targetDay.getDate(),
      original.getHours(),
      original.getMinutes(),
      original.getSeconds(),
    );
  }

  async function loadEvents() {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore caricamento eventi');
      }

      setEvents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || 'Errore caricamento eventi');
    } finally {
      setLoading(false);
    }
  }

  async function handleDrop(day: Date) {
    if (!draggingEventId) return;

    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    const event = events.find((item) => item.id === draggingEventId);

    if (!event) {
      setDraggingEventId(null);
      return;
    }

    const newStartsAt = moveDateKeepingTime(event.startsAt, day);
    const newEndsAt = event.endsAt
      ? moveDateKeepingTime(event.endsAt, day)
      : null;

    const previousEvents = events;

    setEvents((currentEvents) =>
      currentEvents.map((item) =>
        item.id === event.id
          ? {
              ...item,
              startsAt: newStartsAt.toISOString(),
              endsAt: newEndsAt ? newEndsAt.toISOString() : undefined,
            }
          : item,
      ),
    );

    try {
      const res = await fetch(`${API_URL}/api/events/${event.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: event.title,
          description: event.description,
          location: event.location,
          startsAt: newStartsAt.toISOString(),
          endsAt: newEndsAt ? newEndsAt.toISOString() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore spostamento evento');
      }

      toast.success('Evento spostato');
      await loadEvents();
    } catch (err: any) {
      setEvents(previousEvents);
      toast.error(err.message || 'Errore spostamento evento');
    } finally {
      setDraggingEventId(null);
    }
  }

  async function handleCreateEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setCreating(true);

      const res = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          location,
          startsAt,
          endsAt: endsAt || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore creazione evento');
      }

      toast.success('Evento creato');

      setTitle('');
      setDescription('');
      setLocation('');
      setStartsAt('');
      setEndsAt('');

      await loadEvents();
    } catch (err: any) {
      toast.error(err.message || 'Errore creazione evento');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore eliminazione evento');
      }

      toast.success('Evento eliminato');
      await loadEvents();
    } catch (err: any) {
      toast.error(err.message || 'Errore eliminazione evento');
    }
  }

  async function handleRegister(id: string) {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/events/${id}/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore registrazione');
      }

      toast.success('Registrazione completata');
      await loadEvents();
    } catch (err: any) {
      toast.error(err.message || 'Errore registrazione');
    }
  }

  useEffect(() => {
    loadEvents();

    const socket = io(API_URL.replace('/api', ''));

    socket.on('events:changed', (payload?: { message?: string }) => {
      toast.success(payload?.message || 'Eventi aggiornati');
      loadEvents();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 p-8 lg:ml-72">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold">Eventi</h1>
              <p className="mt-2 text-gray-400">
                Calendario eventi con drag & drop
              </p>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-xl border border-white/10 px-5 py-3 hover:bg-white/5"
            >
              Dashboard
            </button>
          </div>

          <section className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
              <p className="text-sm text-gray-400">Eventi</p>
              <h2 className="mt-3 text-4xl font-bold">{events.length}</h2>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
              <p className="text-sm text-gray-400">Registrazioni</p>
              <h2 className="mt-3 text-4xl font-bold">
                {events.reduce(
                  (acc, event) => acc + event.registrationsCount,
                  0,
                )}
              </h2>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
              <p className="text-sm text-gray-400">Mese corrente</p>
              <h2 className="mt-3 text-3xl font-bold capitalize">
                {currentDate.toLocaleDateString('it-IT', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h2>
            </div>
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold capitalize">
                  {currentDate.toLocaleDateString('it-IT', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h2>
                <p className="mt-1 text-gray-400">
                  Trascina un evento su un altro giorno per spostarlo
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                  className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/5"
                >
                  ←
                </button>

                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/5"
                >
                  Oggi
                </button>

                <button
                  onClick={() =>
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                  className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/5"
                >
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 overflow-hidden rounded-2xl border border-white/5">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="border-b border-white/5 bg-[#111827] px-3 py-3 text-center text-sm font-semibold text-gray-400"
                >
                  {day}
                </div>
              ))}

              {calendarDays.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth =
                  day.getMonth() === currentDate.getMonth();
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(day)}
                    className={`min-h-32 border-b border-r border-white/5 p-3 transition ${
                      isCurrentMonth
                        ? 'bg-[#151a27]'
                        : 'bg-[#111827]/50 text-gray-600'
                    } ${draggingEventId ? 'hover:bg-indigo-600/10' : ''}`}
                  >
                    <div
                      className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                        isToday ? 'bg-indigo-600 text-white' : 'text-gray-300'
                      }`}
                    >
                      {day.getDate()}
                    </div>

                    <div className="space-y-2">
                      {dayEvents.slice(0, 4).map((event) => (
                        <div
                          key={event.id}
                          draggable
                          onDragStart={() => setDraggingEventId(event.id)}
                          onDragEnd={() => setDraggingEventId(null)}
                          className={`cursor-move truncate rounded-lg bg-indigo-600/20 px-2 py-1 text-xs text-indigo-200 transition hover:bg-indigo-600/40 ${
                            draggingEventId === event.id ? 'opacity-50' : ''
                          }`}
                          title="Trascina per spostare"
                        >
                          {event.title}
                        </div>
                      ))}

                      {dayEvents.length > 4 && (
                        <p className="text-xs text-gray-400">
                          +{dayEvents.length - 4} altri
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
            <h2 className="mb-6 text-2xl font-bold">Crea evento</h2>

            <form onSubmit={handleCreateEvent} className="grid gap-4">
              <input
                type="text"
                placeholder="Titolo evento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
                required
              />

              <textarea
                placeholder="Descrizione"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
              />

              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
                  required
                />

                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500 disabled:opacity-60"
              >
                {creating ? 'Creazione...' : 'Crea evento'}
              </button>
            </form>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {loading && <p className="text-gray-400">Caricamento...</p>}

            {!loading && events.length === 0 && (
              <p className="text-gray-400">Nessun evento trovato.</p>
            )}

            {!loading &&
              events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-bold">{event.title}</h2>
                      <p className="mt-2 text-gray-400">
                        {event.description || 'Nessuna descrizione'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(event.id)}
                      className="rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                    >
                      Elimina
                    </button>
                  </div>

                  <div className="mt-6 space-y-2 text-sm text-gray-300">
                    <p>📍 {event.location || 'Location non definita'}</p>
                    <p>📅 {new Date(event.startsAt).toLocaleString('it-IT')}</p>
                    <p>👥 {event.registrationsCount} registrazioni</p>
                  </div>

                  <button
                    onClick={() => handleRegister(event.id)}
                    disabled={event.isRegistered}
                    className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {event.isRegistered ? 'Registrato' : 'Registrati'}
                  </button>
                </div>
              ))}
          </section>
        </div>
      </main>
    </div>
  );
}