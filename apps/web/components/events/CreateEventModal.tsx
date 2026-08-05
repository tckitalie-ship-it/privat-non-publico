"use client";

import { useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { API_URL, getAccessToken } from "@/lib/api";

type CreateEventModalProps = {
  open: boolean;
  associationId: string | null;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export default function CreateEventModal({
  open,
  associationId,
  onClose,
  onCreated,
}: CreateEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ CORRETTO: solo open
  if (!open) {
    return null;
  }

  function closeModal() {
    if (!loading) {
      onClose();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!associationId) {
      toast.error("Associazione non disponibile");
      return;
    }

    if (!title.trim()) {
      toast.error("Inserisci il titolo dell’evento");
      return;
    }

    if (!startsAt) {
      toast.error("Inserisci data e ora di inizio");
      return;
    }

    if (endsAt && new Date(endsAt) <= new Date(startsAt)) {
      toast.error("La fine deve essere successiva all’inizio");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      toast.error("Sessione non disponibile");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          associationId,
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          startsAt: new Date(startsAt).toISOString(),
          endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        throw new Error(message || `Errore creazione evento (${response.status})`);
      }

      toast.success("Evento creato con successo");

      await onCreated();
      onClose();
    } catch (error) {
      console.error("Errore creazione evento:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile creare l’evento"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Nuovo evento</h2>
            <p className="mt-2 text-sm text-gray-400">Compila i dati dell’evento.</p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={loading}
            className="rounded-xl border border-white/10 p-2 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-300">Titolo *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={150}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300">Descrizione</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300">Luogo</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-300">Inizio *</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300">Fine</label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className="rounded-xl border border-white/10 px-5 py-3 font-medium text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
            >
              Annulla
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Creazione..." : "Crea evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
