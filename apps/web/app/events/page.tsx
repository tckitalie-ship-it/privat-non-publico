'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { API_URL, getAccessToken } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import DashboardSidebar from '@/components/dashboard-sidebar';
import NotificationBell from '@/components/notification-bell';

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt?: string | null;
  registrationsCount: number;
  isRegistered: boolean;
};

const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

function toDatetimeLocalValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

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
      const nextDay = days.length - startOffset + 1;
      days.push(new Date(year, month, nextDay));
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

  function openCreateModal(day?: Date) {
    const base = day || new Date();
    const start = new Date(base);

    if (day) {
      start.setHours(9, 0, 0, 0);
    }

    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    setTitle('');
    setDescription('');
    setLocation('');
    setStartsAt(toDatetimeLocalValue(start));
    setEndsAt(toDatetimeLocalValue(end));
    setModalOpen(true);
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
      setModalOpen(false);

      await loadEvents();
    } catch (err: any) {
      toast.error(err.message || 'Errore creazione evento');
    } finally {
      setCreating(false);
    }
  }

  async function handleDrop(day: Date) {
    if (!draggingEventId) {
      return;
    }

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
              endsAt: newEndsAt ? newEndsAt.toISOString() : null,
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
          endsAt: newEndsAt ? newEndsAt.toISOString() : null,
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

  async function handleDelete(id: string) {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    const confirmed = window.confirm('Vuoi eliminare questo evento?');

    if (!confirmed) {
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

    const socket = getSocket();

    socket.on('events:changed', (payload?: { message?: string }) => {
      toast.success(payload?.message || 'Eventi aggiornati');
      loadEvents();
    });

    return () => {
      socket.off('events:changed');
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 p-8 lg:ml-72">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-5xl font-bold">Eventi</h1>

              <p className="mt-2 text-gray-400">
                Calendario eventi realtime con drag & drop
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <NotificationBell />

              <button
                onClick={() => openCreateModal()}
                className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500"
              >
                Nuovo evento
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="rounded-xl border border-white/10 px-5 py-3 transition hover:bg-white/5"
              >
                Dashboard
              </button>
            </div>
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
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-bold capitalize">
                  {currentDate.toLocaleDateString('it-IT', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h2>

                <p className="mt-1 text-gray-400">
                  Clicca un giorno per creare. Trascina un evento per spostarlo.
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
                  className="rounded-xl border border-white/10 px-4 py-2 transition hover:bg-white/5"
                >
                  ←
                </button>

                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="rounded-xl border border-white/10 px-4 py-2 transition hover:bg-white/5"
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
                  className="rounded-xl border border-white/10 px-4 py-2 transition hover:bg-white/5"
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
                    onClick={() => openCreateModal(day)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.stopPropagation();
                      handleDrop(day);
                    }}
                    className={`min-h-36 cursor-pointer border-b border-r border-white/5 p-3 transition ${
                      isCurrentMonth
                        ? 'bg-[#151a27]'
                        : 'bg-[#111827]/50 text-gray-600'
                    } ${draggingEventId ? 'hover:bg-indigo-600/10' : 'hover:bg-white/5'}`}
                  >
                    <div
                      className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-300'
                      }`}
                    >
                      {day.getDate()}
                    </div>

                    <div className="space-y-2">
                      {dayEvents.slice(0, 4).map((event) => (
                        <div
                          key={event.id}
                          draggable
                          onClick={(e) => e.stopPropagation()}
                          onDragStart={(e) => {
                            e.stopPropagation();
                            setDraggingEventId(event.id);
                          }}
                          onDragEnd={(e) => {
                            e.stopPropagation();
                            setDraggingEventId(null);
                          }}
                          className={`cursor-move rounded-lg bg-indigo-600/20 px-2 py-2 text-xs text-indigo-100 transition hover:bg-indigo-600/40 ${
                            draggingEventId === event.id ? 'opacity-50' : ''
                          }`}
                          title="Trascina per spostare"
                        >
                          <p className="truncate font-semibold">
                            {event.title}
                          </p>

                          <p className="mt-1 text-[10px] text-indigo-200/80">
                            {new Date(event.startsAt).toLocaleTimeString(
                              'it-IT',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )}
                          </p>
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
                      className="rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                    >
                      Elimina
                    </button>
                  </div>

                  <div className="mt-6 space-y-2 text-sm text-gray-300">
                    <p>📍 {event.location || 'Location non definita'}</p>
                    <p>
                      📅 {new Date(event.startsAt).toLocaleString('it-IT')}
                    </p>
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

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold">Crea evento</h2>

                <p className="mt-1 text-gray-400">
                  Aggiungi un nuovo evento al calendario.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-2 transition hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="grid gap-4">
              <input
                type="text"
                placeholder="Titolo evento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-indigo-500"
                required
              />

              <textarea
                placeholder="Descrizione"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-28 rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-indigo-500"
              />

              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-indigo-500"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-indigo-500"
                  required
                />

                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-white/10 px-5 py-3 transition hover:bg-white/5"
                >
                  Annulla
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500 disabled:opacity-60"
                >
                  {creating ? 'Creazione...' : 'Crea evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}