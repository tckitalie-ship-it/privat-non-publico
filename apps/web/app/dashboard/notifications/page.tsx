"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";

import {
  API_URL,
  getAccessToken,
} from "@/lib/api";

import type { Notification } from "@/types/notification";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

type UserRole = "OWNER" | "ADMIN" | "MEMBER";

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

function getAssociationIdFromToken(): string | null {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalized = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = JSON.parse(
      decodeURIComponent(
        window
          .atob(normalized)
          .split("")
          .map(
            (character) =>
              `%${character
                .charCodeAt(0)
                .toString(16)
                .padStart(2, "0")}`,
          )
          .join(""),
      ),
    );

    return decoded.associationId ?? null;
  } catch (error) {
    console.error(
      "Errore lettura associationId dal JWT:",
      error,
    );

    return null;
  }
}

function getRoleFromToken(): UserRole | null {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalized = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = JSON.parse(
      decodeURIComponent(
        window
          .atob(normalized)
          .split("")
          .map(
            (character) =>
              `%${character
                .charCodeAt(0)
                .toString(16)
                .padStart(2, "0")}`,
          )
          .join(""),
      ),
    ) as { role?: UserRole };

    return decoded.role ?? null;
  } catch (error) {
    console.error(
      "Errore lettura ruolo dal JWT:",
      error,
    );

    return null;
  }
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

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [actionId, setActionId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [toast, setToast] =
    useState<ToastState>(null);

  const [currentUserRole, setCurrentUserRole] =
    useState<UserRole | null>(null);

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

  useEffect(() => {
    setCurrentUserRole(getRoleFromToken());
  }, []);

  const loadNotifications = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      try {
        const associationId =
          getAssociationIdFromToken();

        if (!associationId) {
          throw new Error(
            "Associazione attiva non disponibile.",
          );
        }

        const response =
          await authenticatedFetch(
            `/notifications/association/${associationId}`,
          );

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(response),
          );
        }

        const data =
          (await response.json()) as Notification[];

        setNotifications(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (error) {
        console.error(
          "Errore caricamento notifiche:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "Impossibile caricare le notifiche";

        setNotifications([]);
        setError(message);
        showToast("error", message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  async function createTestNotification() {
    setCreating(true);
    setError(null);

    try {
      const associationId =
        getAssociationIdFromToken();

      if (!associationId) {
        throw new Error(
          "Associazione attiva non disponibile.",
        );
      }

      const response =
        await authenticatedFetch(
          "/notifications",
          {
            method: "POST",
            body: JSON.stringify({
              title: "Notifica di prova",
              message:
                "Il sistema delle notifiche funziona correttamente.",
              associationId,
            }),
          },
        );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response),
        );
      }

      showToast(
        "success",
        "Notifica di prova creata",
      );

      await loadNotifications(false);
    } catch (error) {
      console.error(
        "Errore creazione notifica:",
        error,
      );

      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Impossibile creare la notifica",
      );
    } finally {
      setCreating(false);
    }
  }

  async function markAsRead(
    notificationId: string,
  ) {
    setActionId(notificationId);

    try {
      const response =
        await authenticatedFetch(
          `/notifications/${notificationId}/read`,
          {
            method: "PATCH",
          },
        );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response),
        );
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification,
        ),
      );

      showToast(
        "success",
        "Notifica segnata come letta",
      );
    } catch (error) {
      console.error(
        "Errore lettura notifica:",
        error,
      );

      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Impossibile aggiornare la notifica",
      );
    } finally {
      setActionId(null);
    }
  }

  async function markAllAsRead() {
    setMarkingAll(true);

    try {
      const unreadNotifications =
        notifications.filter(
          (notification) => !notification.read,
        );

      for (const notification of unreadNotifications) {
        const response =
          await authenticatedFetch(
            `/notifications/${notification.id}/read`,
            {
              method: "PATCH",
            },
          );

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(response),
          );
        }
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        })),
      );

      showToast(
        "success",
        "Tutte le notifiche sono state segnate come lette",
      );
    } catch (error) {
      console.error(
        "Errore lettura notifiche:",
        error,
      );

      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Impossibile aggiornare le notifiche",
      );
    } finally {
      setMarkingAll(false);
    }
  }

  async function deleteNotification(
    notificationId: string,
  ) {
    const confirmed = window.confirm(
      "Vuoi eliminare questa notifica?",
    );

    if (!confirmed) {
      return;
    }

    setActionId(notificationId);

    try {
      const response =
        await authenticatedFetch(
          `/notifications/${notificationId}`,
          {
            method: "DELETE",
          },
        );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response),
        );
      }

      setNotifications((current) =>
        current.filter(
          (notification) =>
            notification.id !== notificationId,
        ),
      );

      showToast(
        "success",
        "Notifica eliminata",
      );
    } catch (error) {
      console.error(
        "Errore eliminazione notifica:",
        error,
      );

      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Impossibile eliminare la notifica",
      );
    } finally {
      setActionId(null);
    }
  }

  const unreadCount =
    notifications.filter(
      (notification) => !notification.read,
    ).length;

  const canCreateNotifications =
    currentUserRole === "OWNER" ||
    currentUserRole === "ADMIN";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
      {toast && <Toast toast={toast} />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Notifiche
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            {unreadCount === 0
              ? "Non hai notifiche da leggere."
              : `${unreadCount} notifiche non lette.`}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              void loadNotifications()
            }
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
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

          <button
            type="button"
            onClick={() =>
              void markAllAsRead()
            }
            disabled={
              markingAll ||
              unreadCount === 0
            }
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {markingAll ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <CheckCheck size={17} />
            )}

            Segna tutte come lette
          </button>

          {canCreateNotifications && (
            <button
              type="button"
              onClick={() =>
                void createTestNotification()
              }
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Bell size={17} />
              )}

              Crea notifica di prova
            </button>
          )}
        </div>
      </div>

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

            Caricamento notifiche...
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-10 text-center">
          <Bell
            size={40}
            className="mx-auto text-gray-500"
          />

          <p className="mt-4 font-semibold text-white">
            Nessuna notifica
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Non ci sono notifiche disponibili.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {notifications.map(
            (notification) => {
              const isLoading =
                actionId === notification.id;

              return (
                <li
                  key={notification.id}
                  className={`rounded-2xl border p-5 transition ${
                    notification.read
                      ? "border-white/10 bg-[#0f172a]"
                      : "border-blue-500/30 bg-blue-500/10"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold text-white">
                          {notification.title ??
                            "Notifica"}
                        </h2>

                        {!notification.read && (
                          <span className="rounded-full bg-blue-500 px-2.5 py-1 text-xs font-semibold text-white">
                            Nuova
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-gray-300">
                        {notification.message}
                      </p>

                      <p className="mt-3 text-xs text-gray-500">
                        {formatDate(
                          notification.createdAt,
                        )}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() =>
                            void markAsRead(
                              notification.id,
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

                          Segna letta
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          void deleteNotification(
                            notification.id,
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