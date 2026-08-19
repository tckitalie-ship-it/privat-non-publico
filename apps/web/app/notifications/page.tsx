"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  RefreshCw,
  Trash2,
  Plus,
} from "lucide-react";

import {
  API_URL,
  getAccessToken,
} from "@/lib/api";

type Role = "OWNER" | "ADMIN" | "MEMBER";

type Notification = {
  id: string;
  title?: string | null;
  message: string;
  read: boolean;
  associationId?: string | null;
  userId?: string | null;
  createdAt: string;
};

type JwtPayload = {
  role?: Role;
  associationId?: string | null;
};

function getJwtPayload(): JwtPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = getAccessToken();

  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = decodeURIComponent(
      atob(payload)
        .split("")
        .map(
          (character) =>
            "%" +
            (
              "00" +
              character.charCodeAt(0).toString(16)
            ).slice(-2),
        )
        .join(""),
    );

    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [role, setRole] =
    useState<Role | null>(null);

  const [associationId, setAssociationId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [actionId, setActionId] =
    useState<string | null>(null);

  const [creating, setCreating] =
    useState(false);

  const canManageNotifications =
    role === "OWNER" ||
    role === "ADMIN";

  const loadNotifications =
    useCallback(async () => {
      const token = getAccessToken();

      if (!token) {
        toast.error(
          "Sessione non disponibile.",
        );
        setLoading(false);
        return;
      }

      const payload = getJwtPayload();

      setRole(payload?.role ?? null);
      setAssociationId(
        payload?.associationId ?? null,
      );

      try {
        setRefreshing(true);

        const personalResponse =
          await fetch(
            `${API_URL}/notifications/me`,
            {
              headers: {
                Accept:
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
              cache: "no-store",
            },
          );

        if (!personalResponse.ok) {
          const data =
            await personalResponse
              .json()
              .catch(() => null);

          throw new Error(
            data?.message ??
              "Errore caricamento notifiche.",
          );
        }

        const personalData =
          (await personalResponse.json()) as Notification[];

        let associationData: Notification[] =
          [];

        if (payload?.associationId) {
          const associationResponse =
            await fetch(
              `${API_URL}/notifications/association/${payload.associationId}`,
              {
                headers: {
                  Accept:
                    "application/json",
                  Authorization:
                    `Bearer ${token}`,
                },
                cache: "no-store",
              },
            );

          if (associationResponse.ok) {
            associationData =
              (await associationResponse.json()) as Notification[];
          }
        }

        const merged = [
          ...personalData,
          ...associationData,
        ];

        const unique =
          Array.from(
            new Map(
              merged.map(
                (notification) => [
                  notification.id,
                  notification,
                ],
              ),
            ).values(),
          );

        unique.sort(
          (a, b) =>
            new Date(
              b.createdAt,
            ).getTime() -
            new Date(
              a.createdAt,
            ).getTime(),
        );

        setNotifications(unique);
      } catch (error) {
        console.error(
          "Errore caricamento notifiche:",
          error,
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Errore caricamento notifiche.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  async function markAsRead(id: string) {
    const token = getAccessToken();

    if (!token) {
      toast.error(
        "Sessione non disponibile.",
      );
      return;
    }

    try {
      setActionId(id);

      const response = await fetch(
        `${API_URL}/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization:
              `Bearer ${token}`,
          },
        },
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Errore durante la lettura della notifica.",
        );
      }

      setNotifications(
        (current) =>
          current.map((notification) =>
            notification.id === id
              ? {
                  ...notification,
                  read: true,
                }
              : notification,
          ),
      );
    } catch (error) {
      console.error(
        "Errore segna come letta:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Errore durante l'operazione.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function markAllAsRead() {
    const token = getAccessToken();

    if (!token) {
      toast.error(
        "Sessione non disponibile.",
      );
      return;
    }

    try {
      setActionId("all");

      const response = await fetch(
        `${API_URL}/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization:
              `Bearer ${token}`,
          },
        },
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Errore durante l'operazione.",
        );
      }

      setNotifications(
        (current) =>
          current.map(
            (notification) => ({
              ...notification,
              read: true,
            }),
          ),
      );

      toast.success(
        data?.message ??
          "Notifiche segnate come lette.",
      );
    } catch (error) {
      console.error(
        "Errore segna tutte come lette:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Errore durante l'operazione.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function deleteNotification(
    id: string,
  ) {
    const token = getAccessToken();

    if (!token) {
      toast.error(
        "Sessione non disponibile.",
      );
      return;
    }

    try {
      setActionId(id);

      const response = await fetch(
        `${API_URL}/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization:
              `Bearer ${token}`,
          },
        },
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Errore durante l'eliminazione.",
        );
      }

      setNotifications(
        (current) =>
          current.filter(
            (notification) =>
              notification.id !== id,
          ),
      );

      toast.success(
        "Notifica eliminata.",
      );
    } catch (error) {
      console.error(
        "Errore eliminazione notifica:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Errore durante l'eliminazione.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function createTestNotification() {
    const token = getAccessToken();

    if (!token) {
      toast.error(
        "Sessione non disponibile.",
      );
      return;
    }

    if (!canManageNotifications) {
      toast.error(
        "Non hai i permessi per creare notifiche.",
      );
      return;
    }

    if (!associationId) {
      toast.error(
        "Nessuna associazione attiva selezionata.",
      );
      return;
    }

    try {
      setCreating(true);

      const response = await fetch(
        `${API_URL}/notifications`,
        {
          method: "POST",
          headers: {
            Accept:
              "application/json",
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            title:
              "Notifica di prova",
            message:
              "Questa è una notifica di prova dell'associazione.",
            associationId,
          }),
        },
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Errore creazione notifica.",
        );
      }

      toast.success(
        "Notifica creata.",
      );

      await loadNotifications();
    } catch (error) {
      console.error(
        "Errore creazione notifica:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Errore creazione notifica.",
      );
    } finally {
      setCreating(false);
    }
  }

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read,
    ).length;

  return (
    <main className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                <Bell size={22} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white">
                  Notifiche
                </h1>

                <p className="mt-2 text-sm text-gray-400">
                  Visualizza e gestisci gli
                  aggiornamenti della tua
                  associazione.
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  {unreadCount === 0
                    ? "Non hai notifiche da leggere."
                    : `${unreadCount} notifiche non lette`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  void loadNotifications()
                }
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                {refreshing ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <RefreshCw size={16} />
                )}
                Aggiorna
              </button>

              <button
                type="button"
                onClick={() =>
                  void markAllAsRead()
                }
                disabled={
                  actionId === "all" ||
                  unreadCount === 0
                }
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                {actionId === "all" ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <CheckCheck size={16} />
                )}
                Segna tutte come lette
              </button>

              {canManageNotifications && (
                <button
                  type="button"
                  onClick={() =>
                    void createTestNotification()
                  }
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Plus size={16} />
                  )}
                  Crea notifica di prova
                </button>
              )}
            </div>
          </div>
        </section>

        {loading ? (
          <section className="flex items-center justify-center rounded-3xl border border-white/10 bg-[#0f172a] p-12 text-gray-400">
            <Loader2
              size={20}
              className="mr-3 animate-spin"
            />
            Caricamento notifiche...
          </section>
        ) : notifications.length === 0 ? (
          <section className="rounded-3xl border border-white/10 bg-[#0f172a] p-12 text-center">
            <Bell
              size={32}
              className="mx-auto text-gray-600"
            />

            <h2 className="mt-4 text-lg font-semibold text-white">
              Nessuna notifica
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Non ci sono notifiche disponibili
              per il tuo account.
            </p>
          </section>
        ) : (
          <section className="space-y-3">
            {notifications.map(
              (notification) => {
                const processing =
                  actionId ===
                  notification.id;

                return (
                  <article
                    key={notification.id}
                    className={`rounded-2xl border p-5 shadow-lg transition ${
                      notification.read
                        ? "border-white/10 bg-[#0f172a]"
                        : "border-indigo-500/30 bg-indigo-500/5"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-indigo-400" />
                          )}

                          <h2 className="font-semibold text-white">
                            {notification.title ??
                              "Notifica"}
                          </h2>
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
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
                          >
                            {processing ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Check size={14} />
                            )}
                            Letta
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            void deleteNotification(
                              notification.id,
                            )
                          }
                          disabled={processing}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {processing ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Elimina
                        </button>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </section>
        )}
      </div>
    </main>
  );
}