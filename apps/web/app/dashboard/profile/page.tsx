"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  CalendarDays,
  CheckCircle2,
  Mail,
  RefreshCw,
  Save,
  Shield,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import {
  API_URL,
  getAccessToken,
} from "@/lib/api";

async function authenticatedFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Sessione non disponibile. Effettua nuovamente il login.");
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
type Role =
  | "OWNER"
  | "ADMIN"
  | "MEMBER";

type Membership = {
  id: string;
  associationId: string;
  role: Role;
  association?: {
    id: string;
    name: string;
    slug?: string | null;
  } | null;
};

type ProfileData = {
  id: string;
  email: string;
  createdAt: string;
  memberships: Membership[];
};

function roleLabel(role: Role) {
  switch (role) {
    case "OWNER":
      return "Owner";
    case "ADMIN":
      return "Admin";
    default:
      return "Membro";
  }
}

function roleClasses(role: Role) {
  switch (role) {
    case "OWNER":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "ADMIN":
      return "border-violet-500/20 bg-violet-500/10 text-violet-300";
    default:
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
  }
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "it-IT",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

function getErrorMessage(
  data: unknown,
  fallback: string,
) {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data
  ) {
    const message = (
      data as {
        message?: string | string[];
      }
    ).message;

    if (Array.isArray(message)) {
      return message.join(", ");
    }

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<ProfileData | null>(null);

  const [email, setEmail] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadProfile = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await authenticatedFetch(
          "/users/me",
        );

        const data =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              data,
              `Errore caricamento profilo (${response.status})`,
            ),
          );
        }

        if (!data) {
          throw new Error(
            "Profilo utente non disponibile.",
          );
        }

        const normalizedProfile =
          data as ProfileData;

        setProfile(normalizedProfile);
        setEmail(
          typeof normalizedProfile.email ===
            "string"
            ? normalizedProfile.email
            : "",
        );
      } catch (error) {
        console.error(
          "Errore caricamento profilo:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "Impossibile caricare il profilo.";

        setProfile(null);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const token = getAccessToken();

    if (!token) {
      toast.error(
        "Sessione non disponibile.",
      );
      return;
    }

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      toast.error(
        "L'email Ã¨ obbligatoria.",
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail,
      )
    ) {
      toast.error(
        "Inserisci un indirizzo email valido.",
      );
      return;
    }

    if (cleanEmail.length > 255) {
      toast.error(
        "L'email non puÃ² superare 255 caratteri.",
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/users/me`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: cleanEmail,
          }),
        },
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Errore aggiornamento profilo (${response.status})`,
          ),
        );
      }

      if (
        data &&
        typeof data === "object"
      ) {
        const updatedProfile =
          data as ProfileData;

        setProfile(updatedProfile);

        setEmail(
          typeof updatedProfile.email ===
            "string"
            ? updatedProfile.email
            : cleanEmail,
        );
      } else {
        setEmail(cleanEmail);
      }

      localStorage.setItem(
        "profileUpdated",
        Date.now().toString(),
      );

      toast.success(
        "Profilo aggiornato correttamente.",
      );
    } catch (error) {
      console.error(
        "Errore aggiornamento profilo:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile aggiornare il profilo.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Profilo
          </h1>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-8 shadow-xl">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-blue-400" />
            Caricamento profilo...
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Profilo
          </h1>
        </div>

        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
          <p className="font-medium text-red-300">
            {error ??
              "Profilo non disponibile."}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadProfile()
            }
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-400/20 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/10"
          >
            <RefreshCw size={15} />
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
          Account
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Profilo
        </h1>

        <p className="mt-2 max-w-2xl text-gray-400">
          Gestisci i dati del tuo account
          e visualizza le associazioni a
          cui appartieni.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <UserRound size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Dati account
              </h2>

              <p className="text-sm text-gray-400">
                Modifica i dati disponibili
                del tuo account.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="profile-email"
                className="block text-sm font-medium text-gray-300"
              >
                Email
              </label>

              <div className="relative mt-2">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  autoComplete="email"
                  maxLength={255}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="nome@email.it"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                ID utente
              </label>

              <div className="mt-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-3">
                <p className="break-all font-mono text-sm text-gray-300">
                  {profile.id}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                Le modifiche vengono salvate
                direttamente sul tuo account.
              </p>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Salva modifiche
                  </>
                )}
              </button>
            </div>
          </form>
        </article>

        <article className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
              <Shield size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Account
              </h2>

              <p className="text-sm text-gray-400">
                Informazioni sulla tua
                posizione nell&apos;associazione.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
              <div className="flex items-center gap-3">
                <CalendarDays
                  size={18}
                  className="text-gray-500"
                />

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Account creato
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {formatDate(
                      profile.createdAt,
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2
                  size={18}
                  className="text-emerald-400"
                />

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Stato account
                  </p>

                  <p className="mt-1 font-medium text-emerald-300">
                    Account attivo
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Associazioni
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {profile.memberships.length}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                associazioni collegate al tuo
                account
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            Membership
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Le tue associazioni
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Associazioni e ruoli collegati al
            tuo account.
          </p>
        </div>

        {profile.memberships.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-gray-500">
              <UserRound size={22} />
            </div>

            <p className="mt-4 text-gray-400">
              Non appartieni ancora a
              nessuna associazione.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {profile.memberships.map(
              (membership) => (
                <article
                  key={membership.id}
                  className="rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-white">
                        {membership.association
                          ?.name ??
                          "Associazione"}
                      </h3>

                      {membership.association
                        ?.slug ? (
                        <p className="mt-1 truncate text-xs text-gray-500">
                          {membership.association.slug}
                        </p>
                      ) : null}
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${roleClasses(
                        membership.role,
                      )}`}
                    >
                      {roleLabel(
                        membership.role,
                      )}
                    </span>
                  </div>

                  <div className="mt-5 border-t border-white/10 pt-4">
                    <p className="text-xs text-gray-500">
                      ID associazione
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-gray-400">
                      {membership.associationId}
                    </p>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}
