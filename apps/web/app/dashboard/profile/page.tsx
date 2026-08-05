"use client";

import { useEffect, useState } from "react";
import { Mail, Shield, UserRound } from "lucide-react";

import { API_URL, getAccessToken } from "@/lib/api";

type ProfileData = {
  id: string;
  email: string;
  memberships?: {
    id: string;
    role: string;
    association?: {
      id: string;
      name: string;
    };
  }[];
};

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<ProfileData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const token = getAccessToken();

      if (!token) {
        setError("Sessione non disponibile");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        const data = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Errore caricamento profilo (${response.status})`,
          );
        }

        setProfile(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Impossibile caricare il profilo",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-8 text-gray-300">
        Caricamento profilo...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
        {error ?? "Profilo non disponibile"}
      </div>
    );
  }

  const membership = profile.memberships?.[0];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
          Account
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Profilo
        </h1>

        <p className="mt-2 text-gray-400">
          Informazioni del tuo account e dell&apos;associazione collegata.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-[#0f172a] p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <UserRound size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Dati account
              </h2>

              <p className="text-sm text-gray-400">
                Informazioni principali del profilo.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">
                ID utente
              </p>

              <p className="mt-1 break-all font-medium text-white">
                {profile.id}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">
                Email
              </p>

              <div className="mt-1 flex items-center gap-2 text-white">
                <Mail size={17} />
                <span>{profile.email}</span>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#0f172a] p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
              <Shield size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Associazione
              </h2>

              <p className="text-sm text-gray-400">
                Ruolo e organizzazione attiva.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">
                Nome associazione
              </p>

              <p className="mt-1 font-medium text-white">
                {membership?.association?.name ??
                  "Nessuna associazione"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">
                Ruolo
              </p>

              <p className="mt-1 font-medium text-white">
                {membership?.role ?? "Non assegnato"}
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}