"use client";

import Image from "next/image";
import ChangePasswordModal from "@/components/settings/ChangePasswordModal";
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
  Globe2,
  ImageIcon,
  Loader2,
  Lock,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

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
  createdAt?: string;
  updatedAt?: string;
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
    const payloadPart =
      token.split(".")[1];

    if (!payloadPart) {
      return null;
    }

    const normalized =
      payloadPart
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const padded =
      normalized.padEnd(
        normalized.length +
          ((4 -
            (normalized.length % 4)) %
            4),
        "=",
      );

    return JSON.parse(
      window.atob(padded),
    ) as JwtPayload;
  } catch (error) {
    console.error(
      "Errore lettura token:",
      error,
    );

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

  const [slug, setSlug] =
    useState("");

  const [logoUrl, setLogoUrl] =
    useState("");

  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(true);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    passwordModalOpen,
    setPasswordModalOpen,
  ] = useState(false);

  const [
    savingNotifications,
    setSavingNotifications,
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

        const requests: Promise<Response>[] =
          [
            fetch(
              `${API_URL}/auth/me`,
              {
                method: "GET",
                headers: {
                  Accept:
                    "application/json",
                  Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
              },
            ),
          ];

        if (resolvedAssociationId) {
          requests.push(
            fetch(
              `${API_URL}/associations/${resolvedAssociationId}`,
              {
                method: "GET",
                headers: {
                  Accept:
                    "application/json",
                  Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
              },
            ),
          );
        }

        const responses =
          await Promise.all(
            requests,
          );

        const userResponse =
          responses[0];

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
        }

        const associationResponse =
          responses[1];

        if (associationResponse) {
          const associationData =
            (await associationResponse
              .json()
              .catch(() => null)) as
              | Association
              | null;

          if (
            !associationResponse.ok
          ) {
            throw new Error(
              getErrorMessage(
                associationData,
                `Errore caricamento associazione (${associationResponse.status})`,
              ),
            );
          }

          if (associationData) {
            setAssociation(
              associationData,
            );

            setName(
              associationData.name ??
                "",
            );

            setDescription(
              associationData.description ??
                "",
            );

            setSlug(
              associationData.slug ??
                "",
            );

            setLogoUrl(
              associationData.logoUrl ??
                "",
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
    const timeoutId =
      window.setTimeout(() => {
        void loadSettings();
      }, 0);

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
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
    const cleanSlug = slug.trim();
    const cleanLogoUrl =
      logoUrl.trim();

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

      const response = await fetch(
        `${API_URL}/associations/${associationId}`,
        {
          method: "PATCH",
          headers: {
            Accept:
              "application/json",
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: cleanName,
            description:
              cleanDescription || null,
            slug:
              cleanSlug || null,
            logoUrl:
              cleanLogoUrl || null,
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
        setSlug(
          data.slug ?? "",
        );
        setLogoUrl(
          data.logoUrl ?? "",
        );
      }

      toast.success(
        "Impostazioni associazione salvate",
      );

      localStorage.setItem(
        "associationUpdated",
        Date.now().toString(),
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

  async function saveNotificationPreference() {
    try {
      setSavingNotifications(
        true,
      );

      localStorage.setItem(
        "notificationsEnabled",
        String(
          notificationsEnabled,
        ),
      );

      await new Promise(
        (resolve) =>
          window.setTimeout(
            resolve,
            250,
          ),
      );

      toast.success(
        "Preferenze notifiche salvate",
      );
    } finally {
      setSavingNotifications(
        false,
      );
    }
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
          Gestisci i dati
          dell&apos;associazione, il
          profilo e le preferenze
          della piattaforma.
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
                Informazioni associazione
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Aggiorna i dati
                principali
                dell&apos;associazione.
              </p>
            </div>
          </div>

          {!canEditAssociation && (
            <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">
              Il tuo ruolo non
              consente di modificare
              queste informazioni.
            </div>
          )}

          <fieldset
            disabled={
              !canEditAssociation ||
              saving
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
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                required
                maxLength={150}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500"
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
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500"
                placeholder="Descrivi lo scopo e le attività dell'associazione..."
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="association-slug"
                  className="text-sm font-medium text-gray-300"
                >
                  Slug
                </label>

                <div className="relative mt-2">
                  <Globe2
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    id="association-slug"
                    type="text"
                    value={slug}
                    onChange={(event) =>
                      setSlug(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#111827] py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500"
                    placeholder="associazione-demo"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="association-logo"
                  className="text-sm font-medium text-gray-300"
                >
                  URL logo
                </label>

                <div className="relative mt-2">
                  <ImageIcon
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    id="association-logo"
                    type="url"
                    value={logoUrl}
                    onChange={(event) =>
                      setLogoUrl(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#111827] py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
            {logoUrl && (
              <div className="rounded-2xl border border-white/10 bg-[#111827] p-4">
                <p className="mb-3 text-sm font-medium text-gray-300">
                  Anteprima logo
                </p>

                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <Image
                    src={logoUrl}
                    alt="Logo associazione"
                    width={96}
                    height={96}
                    className="h-full w-full object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={
                saving ||
                !canEditAssociation
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
                  Informazioni
                  dell&apos;utente
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
                  <ShieldCheck
                    size={16}
                  />

                  {currentRole ??
                    "Non disponibile"}
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-xl">
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                <CheckCircle2
                  size={22}
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Stato associazione
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Stato operativo
                  corrente.
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
                Configura le
                preferenze locali
                degli avvisi.
              </p>
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#111827] px-4 py-4">
            <div>
              <p className="font-medium text-white">
                Notifiche abilitate
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Ricevi aggiornamenti
                su membri, eventi,
                finanze e documenti.
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
            onClick={() =>
              void saveNotificationPreference()
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
                Gestione della
                password dell&apos;account.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
              <p className="font-medium text-white">
                Password account
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Modifica la password
                del tuo account.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setPasswordModalOpen(
                  true,
                )
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
              disponibili solo a
              OWNER e ADMIN.
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
