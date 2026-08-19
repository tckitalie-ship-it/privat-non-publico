"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Bell,
  Building2,
  CheckCircle2,
  Loader2,
  Lock,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import ChangePasswordModal from "@/components/settings/ChangePasswordModal";
import {
  API_URL,
  getAccessToken,
} from "@/lib/api";

type Role =
  | "OWNER"
  | "ADMIN"
  | "MEMBER";

type JwtPayload = {
  sub?: string;
  email?: string;
  associationId?: string | null;
  role?: Role | null;
};

type Association = {
  id: string;
  name: string;
  description?: string | null;
  slug?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
};

type CurrentUser = {
  id?: string;
  sub?: string;
  email?: string;
  associationId?: string | null;
  role?: Role | null;
};

function decodeToken(
  token: string,
): JwtPayload | null {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalized = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = normalized.padEnd(
      normalized.length +
        ((4 - (normalized.length % 4)) % 4),
      "=",
    );

    return JSON.parse(
      window.atob(padded),
    ) as JwtPayload;
  } catch {
    return null;
  }
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

export default function SettingsPage() {
  const [associationId, setAssociationId] =
    useState<string | null>(null);

  const [currentRole, setCurrentRole] =
    useState<Role | null>(null);

  const [association, setAssociation] =
    useState<Association | null>(null);

  const [email, setEmail] =
    useState("");

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(true);

  const [
    savingNotifications,
    setSavingNotifications,
  ] = useState(false);

  const [
    passwordModalOpen,
    setPasswordModalOpen,
  ] = useState(false);

  const canEditAssociation =
    currentRole === "OWNER" ||
    currentRole === "ADMIN";

  const loadSettings =
    useCallback(async () => {
      const token = getAccessToken();

      if (!token) {
        toast.error(
          "Sessione non disponibile",
        );
        setLoading(false);
        return;
      }

      const payload =
        decodeToken(token);

      const resolvedAssociationId =
        payload?.associationId ?? null;

      setAssociationId(
        resolvedAssociationId,
      );

      setCurrentRole(
        payload?.role ?? null,
      );

      if (payload?.email) {
        setEmail(payload.email);
      }

      try {
        setLoading(true);

        const userResponse =
          await fetch(
            `${API_URL}/auth/me`,
            {
              method: "GET",
              headers: {
                Accept:
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
              cache: "no-store",
            },
          );

        const userData =
          (await userResponse
            .json()
            .catch(() => null)) as
            | CurrentUser
            | null;

        if (userResponse.ok) {
          setEmail(
            userData?.email ??
              payload?.email ??
              "",
          );

          if (userData?.associationId) {
            setAssociationId(
              userData.associationId,
            );
          }

          if (userData?.role) {
            setCurrentRole(
              userData.role,
            );
          }
        }

        const finalAssociationId =
          userData?.associationId ??
          resolvedAssociationId;

        if (finalAssociationId) {
          const response =
            await fetch(
              `${API_URL}/associations/${finalAssociationId}`,
              {
                method: "GET",
                headers: {
                  Accept:
                    "application/json",
                  Authorization:
                    `Bearer ${token}`,
                },
                cache: "no-store",
              },
            );

          const data =
            (await response
              .json()
              .catch(() => null)) as
              | Association
              | null;

          if (!response.ok) {
            throw new Error(
              getErrorMessage(
                data,
                `Errore caricamento associazione (${response.status})`,
              ),
            );
          }

          if (data) {
            setAssociation(data);
            setAssociationId(data.id);
            setName(data.name ?? "");
            setDescription(
              data.description ?? "",
            );
          }
        }

        const storedPreference =
          localStorage.getItem(
            "notificationsEnabled",
          );

        if (
          storedPreference !== null
        ) {
          setNotificationsEnabled(
            storedPreference === "true",
          );
        }
      } catch (error) {
        console.error(
          "Errore caricamento impostazioni:",
          error,
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Impossibile caricare le impostazioni",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function saveAssociation(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!associationId) {
      toast.error(
        "Nessuna associazione attiva selezionata",
      );
      return;
    }

    if (!canEditAssociation) {
      toast.error(
        "Non hai i permessi per modificare l'associazione",
      );
      return;
    }

    const cleanName = name.trim();
    const cleanDescription =
      description.trim();

    if (!cleanName) {
      toast.error(
        "Il nome dell'associazione è obbligatorio",
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
      setSaving(true);

      const response =
        await fetch(
          `${API_URL}/associations/${associationId}`,
          {
            method: "PATCH",
            headers: {
              Accept:
                "application/json",
              "Content-Type":
                "application/json",
              Authorization:
                `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: cleanName,
              description:
                cleanDescription || null,
            }),
          },
        );

      const data =
        (await response
          .json()
          .catch(() => null)) as
          | Association
          | null;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Errore salvataggio associazione (${response.status})`,
          ),
        );
      }

      if (data) {
        setAssociation(data);
        setName(data.name ?? "");
        setDescription(
          data.description ?? "",
        );
      }

      toast.success(
        "Impostazioni associazione salvate",
      );
    } catch (error) {
      console.error(
        "Errore salvataggio associazione:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Impossibile salvare le impostazioni",
      );
    } finally {
      setSaving(false);
    }
  }

  function saveNotificationPreference() {
    setSavingNotifications(true);

    localStorage.setItem(
      "notificationsEnabled",
      String(notificationsEnabled),
    );

    window.setTimeout(() => {
      setSavingNotifications(false);

      toast.success(
        "Preferenze notifiche salvate",
      );
    }, 250);
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-3xl border border-white/10 bg-[#0f172a]">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2
            size={22}
            className="animate-spin"
          />
          Caricamento impostazioni...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
          Sistema
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Impostazioni
        </h1>

        <p className="mt-2 text-gray-400">
          Gestisci associazione,
          profilo, notifiche e sicurezza.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <form
          onSubmit={saveAssociation}
          className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-xl"
        >
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <Building2 size={23} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Associazione
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Informazioni principali
                dell&apos;associazione.
              </p>
            </div>
          </div>

          {!associationId && (
            <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">
              Nessuna associazione
              attiva selezionata.
            </div>
          )}

          {!canEditAssociation && (
            <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">
              Il tuo ruolo non consente
              di modificare i dati
              dell&apos;associazione.
            </div>
          )}

          <fieldset
            disabled={
              !canEditAssociation ||
              saving ||
              !associationId
            }
            className="space-y-5 disabled:opacity-70"
          >
            <div>
              <label
                htmlFor="association-name"
                className="text-sm font-medium text-gray-300"
              >
                Nome associazione *
              </label>

              <input
                id="association-name"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                required
                maxLength={150}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none transition focus:border-blue-500"
                placeholder="Nome associazione"
              />
            </div>

            <div>
              <label
                htmlFor="association-description"
                className="text-sm font-medium text-gray-300"
              >
                Descrizione
              </label>

              <textarea
                id="association-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                rows={5}
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none transition focus:border-blue-500"
                placeholder="Descrizione dell'associazione..."
              />
            </div>

            <button
              type="submit"
              disabled={
                saving ||
                !canEditAssociation ||
                !associationId
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save size={18} />
              )}

              {saving
                ? "Salvataggio..."
                : "Salva modifiche"}
            </button>
          </fieldset>
        </form>

        <div className="space-y-6">
          <article className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-xl">
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
                <User size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Profilo account
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Informazioni dell&apos;utente
                  autenticato.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="text-sm font-medium text-gray-300"
                >
                  Email
                </label>

                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  readOnly
                  className="mt-2 w-full cursor-not-allowed rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-gray-400 outline-none"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-300">
                  Ruolo
                </p>

                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300">
                  <ShieldCheck size={16} />

                  {currentRole ??
                    "Non disponibile"}
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-xl">
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                <CheckCircle2 size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Stato associazione
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Stato operativo corrente.
                </p>
              </div>
            </div>

            <div
              className={`rounded-xl border p-4 ${
                association?.isActive
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/20 bg-red-500/10 text-red-300"
              }`}
            >
              <p className="font-semibold">
                {association?.isActive
                  ? "Associazione attiva"
                  : "Associazione inattiva"}
              </p>

              <p className="mt-1 text-sm opacity-80">
                {association?.isActive
                  ? "La piattaforma è disponibile per i membri."
                  : "L'associazione risulta disattivata."}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-xl">
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
              <Bell size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Notifiche
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Configura le preferenze
                locali degli avvisi.
              </p>
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#111827] px-4 py-4">
            <div>
              <p className="font-medium text-white">
                Notifiche abilitate
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Ricevi aggiornamenti su
                membri, eventi, finanze
                e documenti.
              </p>
            </div>

            <input
              type="checkbox"
              checked={
                notificationsEnabled
              }
              onChange={(event) =>
                setNotificationsEnabled(
                  event.target.checked,
                )
              }
              className="h-5 w-5 accent-blue-600"
            />
          </label>

          <button
            type="button"
            onClick={
              saveNotificationPreference
            }
            disabled={
              savingNotifications
            }
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111827] px-4 py-3 font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            {savingNotifications ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Save size={18} />
            )}

            Salva preferenze
          </button>
        </article>

        <article className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-xl">
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
              <Lock size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Sicurezza
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Gestione della password
                dell&apos;account.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
              <p className="font-medium text-white">
                Password account
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Modifica la password del
                tuo account.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setPasswordModalOpen(true)
              }
              className="w-full rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-500"
            >
              Cambia password
            </button>
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Permessi
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              Gestione impostazioni
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Le modifiche ai dati
              dell&apos;associazione sono
              disponibili solo a OWNER e
              ADMIN.
            </p>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
              canEditAssociation
                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                : "border-amber-400/20 bg-amber-500/10 text-amber-300"
            }`}
          >
            <ShieldCheck size={16} />

            {canEditAssociation
              ? "Modifica consentita"
              : "Sola lettura"}
          </div>
        </div>
      </section>

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() =>
          setPasswordModalOpen(false)
        }
      />
    </div>
  );
}