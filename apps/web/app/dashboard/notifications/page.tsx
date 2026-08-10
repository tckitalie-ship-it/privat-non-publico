"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/api";
import { Notification } from "@/types/notification";

// ⭐ Aggiunta: API_URL + authenticatedFetch + readErrorMessage
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function authenticatedFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();

  console.log("TOKEN:", token);

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (Array.isArray(data?.message)) {
      return data.message.join(", ");
    }
  } catch {
    // Risposta non JSON
  }

  return `Errore ${response.status}`;
}
function getAssociationIdFromToken(): string | null {
  const token = getAccessToken();

  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = JSON.parse(
      decodeURIComponent(
        atob(normalized)
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
  } catch {
    return null;
  }
}
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadNotifications(showLoading = true) {
    if (showLoading) setLoading(true);
    setError(null);

    try {
     const associationId = getAssociationIdFromToken();

if (!associationId) {
  throw new Error("Associazione attiva non disponibile.");
}

const response = await authenticatedFetch(
  `/notifications/association/${associationId}`,
);

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const data = (await response.json()) as Notification[];
      setNotifications(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Impossibile caricare le notifiche."
      );
    } finally {
      setLoading(false);
    }
  }

  async function createTestNotification() {
    setError(null);

    try {
      const response = await authenticatedFetch("/notifications", {
        method: "POST",
        body: JSON.stringify({
          title: "Notifica di prova",
          message: "Il sistema delle notifiche funziona correttamente.",
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      await loadNotifications(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Impossibile creare la notifica di prova."
      );
    }
  }

   useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void loadNotifications();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Notifiche</h1>

      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => void loadNotifications()}
          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white"
        >
          Aggiorna
        </button>

        <button
          type="button"
          onClick={() => void createTestNotification()}
          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white"
        >
          Crea notifica di prova
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-600">Caricamento…</p>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-gray-600">Nessuna notifica trovata.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className="rounded-xl border border-gray-200 p-4"
            >
              <h2 className="text-lg font-medium">{notification.title}</h2>
              <p className="mt-1 text-sm text-gray-700">{notification.message}</p>
              <p className="mt-2 text-xs text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
