"use client";

import { useState } from "react";
import { API_URL, getAccessToken } from "@/lib/api";

export default function NewEventPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getAccessToken();

    const res = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        title,
        description,
        location,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      setMessage("Errore durante la creazione evento.");
      return;
    }

    setMessage("Evento creato correttamente.");
    setTitle("");
    setDescription("");
    setLocation("");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Nuovo evento
        </h1>

        <p className="mt-2 text-gray-600">
          Crea un evento per la tua associazione.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-xl border bg-white p-6 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Titolo
            </label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descrizione
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Luogo
            </label>

            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Crea evento
          </button>

          {message ? (
            <p className="text-sm text-gray-600">{message}</p>
          ) : null}
        </form>
      </div>
    </main>
  );
}
