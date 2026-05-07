'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL, getAccessToken } from '../../lib/api';

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

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');

  const [message, setMessage] = useState('');

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

      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setMessage('Errore caricamento eventi');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleCreateEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');

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

      setMessage('Evento creato');

      await loadEvents();
    } catch (err: any) {
      setMessage(err.message || 'Errore creazione evento');
    }
  }

  async function registerToEvent(eventId: string) {
    setMessage('');

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

      setMessage('Registrazione completata');

      await loadEvents();
    } catch (err: any) {
      setMessage(err.message || 'Errore registrazione');
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Eventi</h1>

        <button
          onClick={() => router.push('/dashboard')}
          className="border px-3 py-2 rounded"
        >
          Dashboard
        </button>
      </div>

      <form
        onSubmit={handleCreateEvent}
        className="bg-white shadow rounded-xl p-5 space-y-4"
      >
        <h2 className="text-xl font-semibold">Crea evento</h2>

        {message && (
          <div className="bg-gray-100 p-3 rounded text-sm">{message}</div>
        )}

        <input
          type="text"
          placeholder="Titolo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />

        <textarea
          placeholder="Descrizione"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="text"
          placeholder="Luogo"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Crea evento
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Lista eventi</h2>

        {loading && <p className="text-gray-500">Caricamento...</p>}

        {!loading && events.length === 0 && (
          <p className="text-gray-500">Nessun evento.</p>
        )}

        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white shadow rounded-xl p-5 space-y-4 border"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">{event.title}</h3>
                <p className="text-gray-600 mt-2">{event.description}</p>
              </div>

              <button
                onClick={() => registerToEvent(event.id)}
                className="bg-green-600 text-white px-4 py-2 rounded whitespace-nowrap"
              >
                Registrati
              </button>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>📍 {event.location}</p>
              <p>🗓 {new Date(event.startsAt).toLocaleString()}</p>
            </div>

            <div className="text-sm text-gray-500">
              Partecipanti: {event.registrations?.length ?? 0}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}