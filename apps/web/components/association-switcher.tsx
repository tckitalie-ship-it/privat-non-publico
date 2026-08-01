"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

import {
  API_URL,
  getAccessToken,
  setAccessToken,
} from "@/lib/api";

import { cn } from "@/lib/utils";

interface Association {
  id: string;
  name: string;
}

interface JwtPayload {
  sub?: string;
  email?: string;
  associationId?: string | null;
  role?: string | null;
}

function readJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalized = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = decodeURIComponent(
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
    );

    return JSON.parse(decoded) as JwtPayload;
  } catch (error) {
    console.error("Errore lettura JWT:", error);
    return null;
  }
}

export default function AssociationSwitcher() {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [currentAssociation, setCurrentAssociation] =
    useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAssociations() {
      const token = getAccessToken();

      if (!token) {
        setError("Sessione non disponibile");
        setLoading(false);
        return;
      }

      try {
        setError("");

        const payload = readJwtPayload(token);

        const response = await fetch(`${API_URL}/associations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);

          throw new Error(
            data?.message ||
              `Errore caricamento associazioni (${response.status})`,
          );
        }

        const data = await response.json();

        const associationList: Association[] = Array.isArray(data)
          ? data
          : [];

        setAssociations(associationList);

        const tokenAssociationId =
          payload?.associationId ?? null;

        const tokenAssociationExists = associationList.some(
          (association) =>
            association.id === tokenAssociationId,
        );

        if (tokenAssociationExists) {
          setCurrentAssociation(tokenAssociationId);
        } else if (associationList.length === 1) {
          setCurrentAssociation(associationList[0].id);
        } else {
          setCurrentAssociation(null);
        }
      } catch (error) {
        console.error("Errore caricamento associazioni:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Impossibile caricare le associazioni",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadAssociations();
  }, []);

  async function handleSwitch(associationId: string) {
    const token = getAccessToken();

    if (!token || switchingId) {
      return;
    }

    setSwitchingId(associationId);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/auth/switch-association`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ associationId }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Errore cambio associazione (${response.status})`,
        );
      }

      // 🔥 FIX CORRETTA
      const newToken = data?.accessToken;

      if (!newToken) {
        throw new Error("Il backend non ha restituito accessToken");
      }

      setAccessToken(newToken);
      setCurrentAssociation(associationId);
      setOpen(false);

      window.location.reload();
    } catch (error) {
      console.error("Errore cambio associazione:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Impossibile cambiare associazione",
      );
    } finally {
      setSwitchingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 size={18} className="animate-spin" />
        Caricamento associazioni...
      </div>
    );
  }

  if (error && associations.length === 0) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (associations.length === 0) {
    return (
      <div className="rounded-xl border border-[#21262d] bg-[#161b22] px-4 py-3 text-sm text-gray-400">
        Nessuna associazione disponibile
      </div>
    );
  }

  const selectedAssociation = associations.find(
    (association) =>
      association.id === currentAssociation,
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-xl border border-[#21262d] bg-[#161b22] px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-[#1c2128]"
        aria-expanded={open}
      >
        <span className="truncate">
          {selectedAssociation?.name ??
            "Seleziona associazione"}
        </span>

        <ChevronDown
          size={18}
          className={cn(
            "shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-[#21262d] bg-[#161b22] shadow-xl">
          {associations.map((association) => {
            const active =
              association.id === currentAssociation;

            const switching =
              switchingId === association.id;

            return (
              <button
                key={association.id}
                type="button"
                onClick={() =>
                  void handleSwitch(association.id)
                }
                disabled={switchingId !== null}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition",
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-[#1c2128]",
                  switchingId !== null &&
                    "cursor-not-allowed opacity-70",
                )}
              >
                <span className="truncate">
                  {association.name}
                </span>

                {switching && (
                  <Loader2
                    size={16}
                    className="shrink-0 animate-spin"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
