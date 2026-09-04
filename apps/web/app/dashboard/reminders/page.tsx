"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Check,
  Clock,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import {
  API_URL,
  getAccessToken,
} from "@/lib/api";

type Reminder = {
  id: string;
  title?: string | null;
  message: string;
  remindAt: string;
  completed: boolean;
  associationId?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

type MembershipResponse = {
  associationId?: string;
  association?: {
    id: string;
    name: string;
  };
};

async function authenticatedFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Sessione non disponibile. Effettua nuovamente il login.",
    );
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    cache: "no-store",
  });
}

async function readErrorMessage(
  response: Response,
): Promise<string> {
  const data = await response
    .json()
    .catch(() => null);

  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  return `Errore API (${response.status})`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function requestAssociationId(): Promise<string> {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Sessione non disponibile. Effettua nuovamente il login.",
    );
  }

  const response = await fetch(
    `${API_URL}/memberships/me`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const data =
    (await response
      .json()
      .catch(() => null)) as
      | (MembershipResponse & {
          message?: string | string[];
        })
      | null;

  if (!response.ok) {
    if (Array.isArray(data?.message)) {
      throw new Error(data.message.join(", "));
    }

    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : `Errore associazione (${response.status})`,
    );
  }

  const resolvedId =
    data?.associationId ??
    data?.association?.id;

  if (!resolvedId) {
    throw new Error(
      "Nessuna associazione attiva disponibile.",
    );
  }

  return resolvedId;
}

function Toast({
  toast,
}: {
  toast: NonNullable<ToastState>;
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${
        toast.type === "success"
          ? "bg-emerald-600"
          : "bg-red-600"
      }`}
    >
      {toast.message}
    </div>
  );
}

export default function RemindersPage() {
  const [reminders, setReminders] =
    useState<Reminder[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [actionId, setActionId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [toast, setToast] =
    useState<ToastState>(null);

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [remindAt, setRemindAt] =
    useState("");

  const [associationId, setAssociationId] =
    useState<string | null>(null);

  function showToast(
    type: "success" | "error",
    message: string,
  ) {
    setToast({
      type,
      message,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  const loadReminders = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      try {
        const response =
          await authenticatedFetch(
            "/reminders",
          );

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(response),
          );
        }

        const data =
          (await response.json()) as Reminder[];

        setReminders(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (error) {
        console.error(
          "Errore caricamento reminder:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "Impossibile caricare i reminder";

        setReminders([]);
        setError(message);
        showToast("error", message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadReminders();

    requestAssociationId()
      .then((id) => {
        setAssociationId(id);
      })
      .catch((error) => {
        console.error(
          "Errore caricamento associazione:",
          error,
        );
      });
  }, [loadReminders]);

  async function createReminder(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!message.trim()) {
      showToast(
        "error",
        "Il messaggio del reminder è obbligatorio.",
      );
      return;
    }

    if (!remindAt) {
      showToast(
        "error",
        "Seleziona data e ora del reminder.",
      );
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const response =
        await authenticatedFetch(
          "/reminders",
          {
            method: "POST",
            body: JSON.stringify({
              title:
                title.trim() || null,
              message: message.trim(),
              remindAt: new Date(
                remindAt,
              ).toISOString(),
              associationId,
            }),
          },
        );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response),
        );
      }

      setTitle("");
      setMessage("");
      setRemindAt("");

      showToast(
        "success",
        "Reminder programmato correttamente.",
      );

      await loadReminders(false);
    } catch (error) {
      console.error(
        "Errore creazione reminder:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Impossibile creare il reminder";

      setError(message);
      showToast("error", message);
    } finally {
      setCreating(false);
    }
  }

  async function completeReminder(
    reminderId: string,
  ) {
    setActionId(reminderId);

    try {
      const response =
        await authenticatedFetch(
          `/reminders/${reminderId}`,
          {
            method: "PATCH",
          },
        );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response),
        );
      }

      setReminders((current) =>
        current.map((reminder) =>
          reminder.id === reminderId
            ? {
                ...reminder,
                completed: true,
              }
            : reminder,
        ),
      );

      showToast(
        "success",
        "Reminder completato.",
      );
    } catch (error) {
      console.error(
        "Errore completamento reminder:",
        error,
      );

      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Impossibile completare il reminder",
      );
    } finally {
      setActionId(null);
    }
  }

  async function deleteReminder(
    reminderId: string,
  ) {
    const confirmed = window.confirm(
      "Vuoi eliminare questo reminder?",
    );

    if (!confirmed) {
      return;
    }

    setActionId(reminderId);

    try {
      const response =
        await authenticatedFetch(
          `/reminders/${reminderId}`,
          {
            method: "DELETE",
          },
        );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response),
        );
      }

      setReminders((current) =>
        current.filter(
          (reminder) =>
            reminder.id !== reminderId,
        ),
      );

      showToast(
        "success",
        "Reminder eliminato.",
      );
    } catch (error) {
      console.error(
        "Errore eliminazione reminder:",
        error,
      );

      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Impossibile eliminare il reminder",
      );
    } finally {
      setActionId(null);
    }
  }

  const pendingCount =
    reminders.filter(
      (reminder) => !reminder.completed,
    ).length;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
      {toast && <Toast toast={toast} />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Reminder
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            {pendingCount === 0
              ? "Non hai reminder programmati."
              : `${pendingCount} reminder ancora da completare.`}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadReminders()
          }
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <RefreshCw size={17} />
          )}

          Aggiorna
        </button>
      </div>

      <form
        onSubmit={createReminder}
        className="rounded-2xl border border-white/10 bg-[#0f172a] p-6"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-2 text-blue-300">
            <Plus size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              Nuovo reminder
            </h2>

            <p className="text-sm text-gray-400">
              Programma un promemoria per te.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">
              Titolo
            </span>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Es. Controllare documenti"
              className="w-full rounded-xl border border-white/10 bg-[#161b22] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">
              Data e ora
            </span>

            <input
              type="datetime-local"
              value={remindAt}
              onChange={(event) =>
                setRemindAt(
                  event.target.value,
                )
              }
              required
              className="w-full rounded-xl border border-white/10 bg-[#161b22] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium text-gray-300">
            Messaggio
          </span>

          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            placeholder="Cosa vuoi ricordarti?"
            rows={4}
            required
            className="w-full resize-none rounded-xl border border-white/10 bg-[#161b22] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
          />
        </label>

        {associationId && (
          <p className="mt-3 text-xs text-gray-500">
            Il reminder sarà collegato
            all'associazione attiva.
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Bell size={17} />
            )}

            Programma reminder
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-white/10 bg-[#0f172a]">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Loader2
              size={20}
              className="animate-spin"
            />

            Caricamento reminder...
          </div>
        </div>
      ) : reminders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-10 text-center">
          <Clock
            size={40}
            className="mx-auto text-gray-500"
          />

          <p className="mt-4 font-semibold text-white">
            Nessun reminder
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Non hai ancora programmato
            nessun reminder.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reminders.map(
            (reminder) => {
              const isLoading =
                actionId === reminder.id;

              return (
                <li
                  key={reminder.id}
                  className={`rounded-2xl border p-5 transition ${
                    reminder.completed
                      ? "border-white/10 bg-[#0f172a] opacity-70"
                      : "border-blue-500/30 bg-blue-500/10"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold text-white">
                          {reminder.title ??
                            "Reminder"}
                        </h2>

                        {reminder.completed && (
                          <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white">
                            Completato
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-gray-300">
                        {reminder.message}
                      </p>

                      <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={14} />
                        {formatDate(
                          reminder.remindAt,
                        )}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {!reminder.completed && (
                        <button
                          type="button"
                          onClick={() =>
                            void completeReminder(
                              reminder.id,
                            )
                          }
                          disabled={isLoading}
                          className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Check size={15} />
                          )}

                          Completa
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          void deleteReminder(
                            reminder.id,
                          )
                        }
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={15} />
                        )}

                        Elimina
                      </button>
                    </div>
                  </div>
                </li>
              );
            },
          )}
        </ul>
      )}
    </div>
  );
}


