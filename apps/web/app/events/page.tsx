'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { API_URL, getAccessToken } from '@/lib/api';

type EventItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  registrations?: {
    id: string;
  }[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');

  const nextEvent = useMemo(() => {
    return [...events].sort(
      (a, b) =>
        new Date(a.startsAt).getTime() -
        new Date(b.startsAt).getTime(),
    )[0];
  }, [events]);

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

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleCreateEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore creazione evento');
      }

      setTitle('');
      setDescription('');
      setLocation('');
      setStartsAt('');

      toast.success('Evento creato');

      await loadEvents();
    } catch (err: any) {
      toast.error(err.message || 'Errore creazione evento');
    }
  }

  async function registerToEvent(eventId: string) {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/events/${eventId}/register`, {
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

  return (
    <main className="min-h-screen bg-[#0f1117] p-8 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold">Eventi</h1>
            <p className="mt-2 text-gray-400">
              Crea, gestisci e monitora gli eventi della tua associazione
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-xl border border-white/10 px-5 py-3 transition hover:bg-white/5"
          >
            Dashboard
          </button>
        </div>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6 shadow-xl">
            <p className="text-sm text-gray-400">Eventi totali</p>
            <h2 className="mt-3 text-4xl font-bold">{events.length}</h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6 shadow-xl">
            <p className="text-sm text-gray-400">Partecipanti</p>
            <h2 className="mt-3 text-4xl font-bold">
              {events.reduce(
                (acc, event) => acc + (event.registrations?.length ?? 0),
                0,
              )}
            </h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6 shadow-xl">
            <p className="text-sm text-gray-400">Prossimo evento</p>
            <h2 className="mt-3 text-xl font-bold">
              {nextEvent ? nextEvent.title : 'Nessuno'}
            </h2>
            {nextEvent && (
              <p className="mt-2 text-sm text-gray-400">
                {formatDate(nextEvent.startsAt)} · {formatTime(nextEvent.startsAt)}
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleCreateEvent}
            className="space-y-4 rounded-3xl border border-white/5 bg-[#1a1f2e] p-6 shadow-xl"
          >
            <h2 className="text-2xl font-bold">Crea evento</h2>

            <input
              type="text"
              placeholder="Titolo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-indigo-500"
              required
            />

            <textarea
              placeholder="Descrizione"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-28 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-indigo-500"
            />

            <input
              type="text"
              placeholder="Luogo"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-indigo-500"
            />

            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-indigo-500"
              required
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500"
            >
              Crea evento
            </button>
          </form>

          <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Calendario eventi</h2>
                <p className="text-sm text-gray-400">
                  Lista eventi programmati
                </p>
              </div>
            </div>

            {loading && <p className="text-gray-400">Caricamento...</p>}

 {!loading && events.length === 0 && (
  <div className="rounded-3xl border border-dashed border-white/10 bg-[#111827] p-12 text-center">
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600/20 text-4xl">
      📅
    </div>

    <h3 className="mt-6 text-2xl font-bold">
      Nessun evento creato
    </h3>

    <p className="mt-3 text-gray-400">
      Inizia creando il tuo primo evento per la community.
    </p>
  </div>
)}

            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="grid gap-4 rounded-2xl border border-white/5 bg-[#111827] p-5 md:grid-cols-[90px_1fr_auto]"
                >
                  <div className="rounded-2xl bg-indigo-600/20 p-4 text-center">
                    <p className="text-2xl font-bold">
                      {new Date(event.startsAt).getDate()}
                    </p>
                    <p className="text-xs uppercase text-indigo-300">
                      {new Date(event.startsAt).toLocaleDateString('it-IT', {
                        month: 'short',
                      })}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">{event.title}</h3>
                    <p className="mt-1 text-gray-400">{event.description}</p>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-300">
                      <span>📍 {event.location || 'Luogo non indicato'}</span>
                      <span>🕒 {formatTime(event.startsAt)}</span>
                      <span>
                        👥 {event.registrations?.length ?? 0} partecipanti
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => registerToEvent(event.id)}
                    className="h-fit rounded-xl bg-emerald-600 px-5 py-3 font-semibold transition hover:bg-emerald-500"
                  >
                    Registrati
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}