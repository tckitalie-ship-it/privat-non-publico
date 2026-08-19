"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import {
  API_URL,
  getAccessToken,
} from "@/lib/api";

type EditableEvent = {
  id: string;
  associationId?: string | null;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt?: string | null;
};

type EditEventModalProps = {
  open: boolean;
  event: EditableEvent | null;
  associationId?: string | null;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
};

function toDateTimeLocal(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset =
    date.getTimezoneOffset();

  const localDate = new Date(
    date.getTime() -
      timezoneOffset * 60 * 1000,
  );

  return localDate.toISOString().slice(0, 16);
}

export default function EditEventModal({
  open,
  event,
  onClose,
  onUpdated,
}: EditEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [location, setLocation] =
    useState("");
  const [startsAt, setStartsAt] =
    useState("");
  const [endsAt, setEndsAt] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (!open || !event) {
      return;
    }

    setTitle(event.title ?? "");
    setDescription(event.description ?? "");
    setLocation(event.location ?? "");
    setStartsAt(
      toDateTimeLocal(event.startsAt),
    );
    setEndsAt(
      toDateTimeLocal(event.endsAt),
    );
  }, [event, open]);

  if (!open || !event) {
    return null;
  }

  const eventId = event.id;

  function closeModal() {
    if (loading) {
      return;
    }

    onClose();
  }

  async function handleSubmit(
    formEvent: FormEvent<HTMLFormElement>,
  ) {
    formEvent.preventDefault();

    console.log(
      "[EDIT EVENT] submit",
      eventId,
    );

    if (!title.trim()) {
      toast.error(
        "Inserisci il titolo dell'evento",
      );
      return;
    }

    if (!startsAt) {
      toast.error(
        "Inserisci data e ora di inizio",
      );
      return;
    }

    const startDate = new Date(startsAt);

    const endDate = endsAt
      ? new Date(endsAt)
      : null;

    if (Number.isNaN(startDate.getTime())) {
      toast.error(
        "Data di inizio non valida",
      );
      return;
    }

    if (
      endDate &&
      Number.isNaN(endDate.getTime())
    ) {
      toast.error(
        "Data di fine non valida",
      );
      return;
    }

    if (
      endDate &&
      endDate.getTime() <=
        startDate.getTime()
    ) {
      toast.error(
        "La fine deve essere successiva all'inizio",
      );
      return;
    }

    const token = getAccessToken();

    if (!token) {
      toast.error(
        "Sessione non disponibile",
      );
      return;
    }

    try {
      setLoading(true);

      const url =
        `${API_URL}/events/${eventId}`;

      console.log(
        "[EDIT EVENT] PATCH",
        url,
      );

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description:
            description.trim() || null,
          location:
            location.trim() || null,
          startsAt:
            startDate.toISOString(),
          endsAt: endDate
            ? endDate.toISOString()
            : null,
        }),
        cache: "no-store",
      });

      const text =
        await response.text();

      let data: any = null;

      try {
        data = text
          ? JSON.parse(text)
          : null;
      } catch {
        data = {
          message: text,
        };
      }

      console.log(
        "[EDIT EVENT] response",
        response.status,
        data,
      );

      if (!response.ok) {
        const message =
          Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message;

        throw new Error(
          message ||
            `Errore modifica evento (${response.status})`,
        );
      }

      toast.success(
        "Evento aggiornato con successo",
      );

      await onUpdated();

      onClose();
    } catch (error) {
      console.error(
        "[EDIT EVENT] errore:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile modificare l'evento",
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
            <h2 className="text-2xl font-bold text-white">
              Modifica evento
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Aggiorna i dati dell'evento.
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={loading}
            aria-label="Chiudi finestra"
            className="rounded-xl border border-white/10 p-2 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="edit-event-title"
              className="text-sm font-medium text-gray-300"
            >
              Titolo *
            </label>

            <input
              id="edit-event-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              required
              maxLength={150}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-indigo-500"
              placeholder="Titolo evento"
            />
          </div>

          <div>
            <label
              htmlFor="edit-event-description"
              className="text-sm font-medium text-gray-300"
            >
              Descrizione
            </label>

            <textarea
              id="edit-event-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-indigo-500"
              placeholder="Descrizione evento"
            />
          </div>

          <div>
            <label
              htmlFor="edit-event-location"
              className="text-sm font-medium text-gray-300"
            >
              Luogo
            </label>

            <input
              id="edit-event-location"
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value,
                )
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-indigo-500"
              placeholder="Luogo evento"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="edit-event-start"
                className="text-sm font-medium text-gray-300"
              >
                Inizio *
              </label>

              <input
                id="edit-event-start"
                type="datetime-local"
                value={startsAt}
                onChange={(event) =>
                  setStartsAt(
                    event.target.value,
                  )
                }
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="edit-event-end"
                className="text-sm font-medium text-gray-300"
              >
                Fine
              </label>

              <input
                id="edit-event-end"
                type="datetime-local"
                value={endsAt}
                onChange={(event) =>
                  setEndsAt(
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className="rounded-xl border border-white/10 px-5 py-3 font-medium text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Annulla
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              )}

              {loading
                ? "Salvataggio..."
                : "Salva modifiche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}