"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL, getAccessToken } from "@/lib/api";

type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const loadMe = useCallback(async () => {
    try {
      const token = getAccessToken();

      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const me = (await res.json()) as User;

      setUser(me);
      setName(me.name);
    } catch {
      setMessage("Errore durante il caricamento del profilo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      loadMe();
    });
  }, [loadMe]);

  const updateProfile = useCallback(async () => {
    try {
      const token = getAccessToken();

      const res = await fetch(`${API_URL}/auth/update-profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        setMessage("Errore durante l'aggiornamento del profilo");
        return;
      }

      setMessage("Profilo aggiornato con successo!");
      loadMe();
    } catch {
      setMessage("Errore di rete");
    }
  }, [name, loadMe]);

  const updatePassword = useCallback(async () => {
    if (!password.trim()) {
      setMessage("La password non può essere vuota");
      return;
    }

    try {
      const token = getAccessToken();

      const res = await fetch(`${API_URL}/auth/update-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setMessage("Errore durante l'aggiornamento della password");
        return;
      }

      setMessage("Password aggiornata con successo!");
      setPassword("");
    } catch {
      setMessage("Errore di rete");
    }
  }, [password]);

  return {
    user,
    loading,
    message,

    name,
    setName,

    password,
    setPassword,

    updateProfile,
    updatePassword,
  };
}