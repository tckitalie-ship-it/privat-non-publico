"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Clock,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";

import {
  API_URL,
  getAccessToken,
} from "@/lib/api";
import { getSocket } from "@/lib/socket";

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

function parseDateTimeLocal(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, year, month, day, hours, minutes] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    0,
    0,
  );

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day) ||
    date.getHours() !== Number(hours) ||
    date.getMinutes() !== Number(minutes)
  ) {
    return null;
  }

  return date;
}

function toDateTimeLocalValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
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

function getReminderStatus(remindAt: string) {
  const now = new Date();
  const date = new Date(remindAt);

  if (date.getTime() < now.getTime()) {
    return {
      label: "Scaduto",
      className: "bg-red-500/15 text-red-300",
    };
  }

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return {
      label: "Oggi",
      className: "bg-amber-500/15 text-amber-300",
    };
  }

  return {
    label: "Programmato",
    className: "bg-blue-500/15 text-blue-300",
  };
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

  const [editingReminderId, setEditingReminderId] =
    useState<string | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editRemindAt, setEditRemindAt] = useState("");

  const [filter, setFilter] = useState<
    "all" | "pending" | "today" | "overdue" | "completed"
  >("all");

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

        console.log(
          "[REMINDERS PAGE]",
          "status:",
          response.status,
          "count:",
          Array.isArray(data) ? data.length : "not-array",
          "data:",
          data,
        );

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

  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadReminders(false);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loadReminders]);

  useEffect(() => {
    const socket = getSocket();

    const handleNewNotification = (notification: {
      reminderId?: string | null;
    }) => {
      const reminderId = notification?.reminderId;
      if (!reminderId) return;

      window.setTimeout(() => {
        void loadReminders(false);
      }, 300);
    };

    const handleReminderCompleted = (event: Event) => {
      const customEvent = event as CustomEvent<{ reminderId?: string }>;
      const reminderId = customEvent.detail?.reminderId;
      if (!reminderId) return;

      setReminders((current) =>
        current.map((reminder) =>
          reminder.id === reminderId
            ? { ...reminder, completed: true }
            : reminder,
        ),
      );
    };

    socket.on("notification:new", handleNewNotification);
    window.addEventListener("reminder:completed", handleReminderCompleted);

    return () => {
      socket.off("notification:new", handleNewNotification);
      window.removeEventListener("reminder:completed", handleReminderCompleted);
    };
  }, [loadReminders]);

  function setQuickReminder(hoursFromNow: number) {
    const date = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    setRemindAt(toDateTimeLocalValue(date));
  }

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

    const selectedDate = parseDateTimeLocal(remindAt);

    if (!selectedDate || remindAt <= toDateTimeLocalValue(new Date())) {
      showToast(
        "error",
        "La data del reminder deve essere nel futuro.",
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
        "Promemoria programmato correttamente.",
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

  function startEditingReminder(reminder: Reminder) {
    const date = new Date(reminder.remindAt);

    setEditingReminderId(reminder.id);
    setEditTitle(reminder.title ?? "");
    setEditMessage(reminder.message);
    setEditRemindAt(toDateTimeLocalValue(date));
  }

  function cancelEditingReminder() {
    setEditingReminderId(null);
    setEditTitle("");
    setEditMessage("");
    setEditRemindAt("");
  }

  async function updateReminder(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!editingReminderId) {
      return;
    }

    if (!editMessage.trim()) {
      showToast(
        "error",
        "Il messaggio del reminder è obbligatorio.",
      );
      return;
    }

    if (!editRemindAt) {
      showToast(
        "error",
        "Seleziona data e ora del reminder.",
      );
      return;
    }

    const selectedDate = parseDateTimeLocal(editRemindAt);

    if (!selectedDate || editRemindAt <= toDateTimeLocalValue(new Date())) {
      showToast(
        "error",
        "La data del reminder deve essere nel futuro.",
      );
      return;
    }

    setActionId(editingReminderId);

    try {
      const response = await authenticatedFetch(
        `/reminders/${editingReminderId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            title: editTitle.trim() || null,
            message: editMessage.trim(),
            remindAt: selectedDate.toISOString(),
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response),
        );
      }

      const updated = (await response.json()) as Reminder;

      setReminders((current) =>
        current.map((reminder) =>
          reminder.id === editingReminderId
            ? updated
            : reminder,
        ),
      );

      cancelEditingReminder();

      showToast(
        "success",
        "Reminder modificato correttamente.",
      );
    } catch (error) {
      console.error(
        "Errore modifica reminder:",
        error,
      );

      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Impossibile modificare il reminder",
      );
    } finally {
      setActionId(null);
    }
  }

  async function completeReminder(
    reminderId: string,
  ) {
    setActionId(reminderId);

    try {
      const response =
        await authenticatedFetch(
          `/reminders/${reminderId}/complete`,
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

      window.dispatchEvent(
        new CustomEvent("reminder:completed", {
          detail: { reminderId },
        }),
      );

      showToast(
        "success",
        "Promemoria completato.",
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
      "Vuoi eliminare questo promemoria?",
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
        "Promemoria eliminato.",
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

  const pendingReminders = reminders
    .filter((reminder) => !reminder.completed)
    .sort(
      (a, b) =>
        new Date(a.remindAt).getTime() -
        new Date(b.remindAt).getTime(),
    );

  const completedReminders = reminders
    .filter((reminder) => reminder.completed)
    .sort(
      (a, b) =>
        new Date(b.remindAt).getTime() -
        new Date(a.remindAt).getTime(),
    );

  const pendingCount = pendingReminders.length;
  const completedCount = completedReminders.length;

  const overdueCount = pendingReminders.filter(
    (reminder) =>
      new Date(reminder.remindAt).getTime() < Date.now(),
  ).length;

  const totalCount = reminders.length;

  const filteredPendingReminders = pendingReminders.filter((reminder) => {
    if (filter === "all" || filter === "pending") {
      return true;
    }

    if (filter === "today") {
      const now = new Date();
      const date = new Date(reminder.remindAt);

      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      );
    }

    if (filter === "overdue") {
      return new Date(reminder.remindAt).getTime() < Date.now();
    }

    return false;
  });

  const filteredCompletedReminders =
    filter === "all" || filter === "completed"
      ? completedReminders
      : [];

  const showPendingSection =
    filteredPendingReminders.length > 0;

  const showCompletedSection =
    filteredCompletedReminders.length > 0;

  return (
    <div className="w-full space-y-6">
      {toast && <Toast toast={toast} />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Promemoria
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            {pendingCount > 0
              ? `${pendingCount} promemoria ancora da completare.`
              : completedCount > 0
                ? `${completedCount} promemoria completati.`
                : "Non hai ancora programmato nessun promemoria."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadReminders()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <RefreshCw size={17} />
          )}
          Aggiorna
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
          <p className="text-xs font-medium text-gray-500">Totali</p>
          <p className="mt-2 text-2xl font-bold text-white">{totalCount}</p>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
          <p className="text-xs font-medium text-blue-300">Da completare</p>
          <p className="mt-2 text-2xl font-bold text-white">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-xs font-medium text-red-300">Scaduti</p>
          <p className="mt-2 text-2xl font-bold text-white">{overdueCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs font-medium text-emerald-300">Completati</p>
          <p className="mt-2 text-2xl font-bold text-white">{completedCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#0f172a] p-3">
        {[
          ["all", "Tutti"],
          ["pending", "Da completare"],
          ["today", "Oggi"],
          ["overdue", "Scaduti"],
          ["completed", "Completati"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() =>
              setFilter(
                value as
                  | "all"
                  | "pending"
                  | "today"
                  | "overdue"
                  | "completed",
              )
            }
            className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
              filter === value
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {editingReminderId && (
        <form
          onSubmit={updateReminder}
          className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6"
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-white">
              Modifica promemoria
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Aggiorna titolo, messaggio, data e ora.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">
                Titolo
              </span>
              <input
                type="text"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#161b22] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">
                Data e ora
              </span>
              <input
                type="datetime-local"
                value={editRemindAt}
                onChange={(event) => setEditRemindAt(event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-[#161b22] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium text-gray-300">
              Messaggio
            </span>
            <textarea
              value={editMessage}
              onChange={(event) => setEditMessage(event.target.value)}
              rows={4}
              required
              className="w-full resize-none rounded-xl border border-white/10 bg-[#161b22] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-500"
            />
          </label>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelEditingReminder}
              disabled={actionId === editingReminderId}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Annulla
            </button>

            <button
              type="submit"
              disabled={actionId === editingReminderId}
              className="rounded-xl bg-amber-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionId === editingReminderId ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={17} className="animate-spin" />
                  Salvataggio...
                </span>
              ) : (
                "Salva modifiche"
              )}
            </button>
          </div>
        </form>
      )}

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
              Nuovo promemoria
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

            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setQuickReminder(1)}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                Tra 1 ora
              </button>

              <button
                type="button"
                onClick={() => setQuickReminder(24)}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                Domani
              </button>
            </div>
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

            Programma promemoria
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
            Non hai ancora programmato nessun reminder.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {pendingReminders.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Da completare
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Promemoria ancora da completare.
                  </p>
                </div>

                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                  {pendingCount}
                </span>
              </div>

              <ul className="space-y-4">
                {filteredPendingReminders.map((reminder) => {
                  const isLoading = actionId === reminder.id;

                  return (
                    <li
                      key={reminder.id}
                      className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5 transition hover:border-blue-500/50"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">
                              {reminder.title ?? "Promemoria"}
                            </h3>

                            <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-300">
                              Da completare
                            </span>

                            {(() => {
                              const status = getReminderStatus(reminder.remindAt);

                              return (
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                                >
                                  {status.label}
                                </span>
                              );
                            })()}
                          </div>

                          <p className="mt-2 text-sm leading-6 text-gray-300">
                            {reminder.message}
                          </p>

                          <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                            <Clock size={14} />
                            {formatDate(reminder.remindAt)}
                          </p>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={(event) => { event.preventDefault(); event.stopPropagation(); startEditingReminder(reminder); }}
                            disabled={isLoading}
                            className="rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Modifica
                          </button>

                          <button
                            type="button"
                            onClick={() => void completeReminder(reminder.id)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isLoading ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              "Completa"
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => void deleteReminder(reminder.id)}
                            disabled={isLoading}
                            className="rounded-xl border border-red-500/20 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Elimina
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {completedReminders.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Completati
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Promemoria già completati.
                  </p>
                </div>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  {completedCount}
                </span>
              </div>

              <ul className="space-y-4">
                {filteredCompletedReminders.map((reminder) => {
                  const isLoading = actionId === reminder.id;

                  return (
                    <li
                      key={reminder.id}
                      className="rounded-2xl border border-emerald-500/10 bg-[#0f172a] p-5 transition hover:border-emerald-500/20"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">
                              {reminder.title ?? "Promemoria"}
                            </h3>

                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                              Completato
                            </span>
                          </div>

                          <p className="mt-2 text-sm leading-6 text-gray-400">
                            {reminder.message}
                          </p>

                          <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                            <Clock size={14} />
                            {formatDate(reminder.remindAt)}
                          </p>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={(event) => { event.preventDefault(); event.stopPropagation(); startEditingReminder(reminder); }}
                            disabled={isLoading}
                            className="rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Modifica
                          </button>

                          <button
                            type="button"
                            onClick={() => void deleteReminder(reminder.id)}
                            disabled={isLoading}
                            className="rounded-xl border border-red-500/20 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Elimina
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
