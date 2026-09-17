"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import {
  API_URL,
  setAccessToken,
} from "@/lib/api";

type InvitationResponse = {
  id?: string;
  email?: string;
  role?: string;
  token?: string;
  valid?: boolean;
  associationId?: string;
  associationName?: string;
  message?: string;
};

type LoginResponse = {
  access_token?: string;
  accessToken?: string;
  token?: string;
  message?: string;
};

async function readResponse<T>(
  response: Response,
): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text);
  }
}

function getErrorMessage(
  data: unknown,
  fallback: string,
): string {
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

export default function AcceptInviteContent({
  token,
}: {
  token: string | null;
}) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [associationName, setAssociationName] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState(false);

  const [message, setMessage] = useState(
    "Verifica invito...",
  );

  const passwordsMatch =
    password === confirmPassword;

  const passwordValid =
    password.length >= 8;

  const canSubmit =
    passwordValid &&
    confirmPassword.length >= 8 &&
    passwordsMatch &&
    !submitting;

  useEffect(() => {
    let cancelled = false;

    async function checkInvitation() {
      if (!token) {
        setError(true);
        setMessage(
          "Token invito mancante.",
        );
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/invitations/check/${encodeURIComponent(token)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data =
          await readResponse<InvitationResponse>(
            response,
          );

        if (
          !response.ok ||
          data.valid === false
        ) {
          throw new Error(
            getErrorMessage(
              data,
              "Invito non valido o scaduto.",
            ),
          );
        }

        if (!data.email) {
          throw new Error(
            "Email dell'invito mancante.",
          );
        }

        if (cancelled) {
          return;
        }

        setEmail(data.email);
        setRole(data.role ?? "");
        setAssociationName(
          data.associationName ?? "",
        );
        setError(false);
        setMessage(
          "Crea il tuo account per accettare l’invito.",
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(true);
        setMessage(
          err instanceof Error
            ? err.message
            : "Errore durante la verifica dell’invito.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void checkInvitation();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function registerAndAccept(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token) {
      setError(true);
      setMessage(
        "Token invito mancante.",
      );
      return;
    }

    if (!email) {
      setError(true);
      setMessage(
        "Email dell'invito mancante.",
      );
      return;
    }

    if (!passwordValid) {
      setError(true);
      setMessage(
        "La password deve contenere almeno 8 caratteri.",
      );
      return;
    }

    if (!passwordsMatch) {
      setError(true);
      setMessage(
        "Le password non coincidono.",
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(false);
      setMessage(
        "Registrazione e accettazione invito...",
      );

      const registerResponse =
        await fetch(
          `${API_URL}/invitations/accept-and-register`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              token,
              email,
              password,
            }),
          },
        );

      const registerData =
        await readResponse<InvitationResponse>(
          registerResponse,
        );

      if (!registerResponse.ok) {
        throw new Error(
          getErrorMessage(
            registerData,
            "Errore durante la registrazione.",
          ),
        );
      }

      const loginResponse =
        await fetch(
          `${API_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
          },
        );

      const loginData =
        await readResponse<LoginResponse>(
          loginResponse,
        );

      const accessToken =
        loginData.accessToken ??
        loginData.access_token ??
        loginData.token;

      if (
        !loginResponse.ok ||
        !accessToken
      ) {
        throw new Error(
          getErrorMessage(
            loginData,
            "Registrazione completata, ma login automatico fallito.",
          ),
        );
      }

      setAccessToken(accessToken);

      localStorage.setItem(
        "membershipUpdated",
        "true",
      );

      localStorage.setItem(
        "associationUpdated",
        Date.now().toString(),
      );

      setError(false);
      setMessage(
        "Registrazione completata e invito accettato!",
      );

      window.setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 800);
    } catch (err) {
      console.error(
        "Errore accettazione invito:",
        err,
      );

      setError(true);
      setMessage(
        err instanceof Error
          ? err.message
          : "Errore durante la registrazione.",
      );
      setSubmitting(false);
    }
  }

  function goToLogin() {
    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f1117] p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1a1f2e] p-8 shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-5 rounded-2xl bg-indigo-500/10 p-4 text-indigo-400">
              <Loader2
                size={30}
                className="animate-spin"
              />
            </div>

            <h1 className="text-2xl font-bold text-white">
              Verifica invito
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              {message}
            </p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <ShieldCheck size={30} />
            </div>

            <h1 className="text-2xl font-bold text-white">
              Invito non disponibile
            </h1>

            <p className="mt-3 text-sm leading-6 text-red-300">
              {message}
            </p>

            <button
              type="button"
              onClick={goToLogin}
              className="mt-8 w-full rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
            >
              Vai al login
            </button>
          </div>
        ) : (
          <>
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                <UserPlus size={30} />
              </div>

              <h1 className="text-3xl font-bold text-white">
                Benvenuto!
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Hai ricevuto un invito a
                partecipare alla piattaforma.
              </p>
            </div>

            {associationName && (
              <div className="mb-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  Associazione
                </p>

                <p className="mt-1 text-lg font-semibold text-white">
                  {associationName}
                </p>

                {role && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300">
                    <ShieldCheck size={14} />
                    {role}
                  </div>
                )}
              </div>
            )}

            <div className="mb-6 rounded-2xl border border-white/10 bg-[#0f1117] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/5 p-2 text-gray-400">
                  <Mail size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-gray-500">
                    Email invitata
                  </p>

                  <p className="truncate text-sm font-medium text-white">
                    {email}
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={registerAndAccept}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="invite-password"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >
                  Password
                </label>

                <input
                  id="invite-password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Minimo 8 caratteri"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  disabled={submitting}
                  className="w-full rounded-xl border border-white/10 bg-[#0f1117] p-3 text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {password.length > 0 &&
                  password.length < 8 && (
                    <p className="mt-2 text-xs text-amber-300">
                      La password deve contenere
                      almeno 8 caratteri.
                    </p>
                  )}
              </div>

              <div>
                <label
                  htmlFor="invite-confirm-password"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >
                  Conferma password
                </label>

                <input
                  id="invite-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Ripeti la password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  disabled={submitting}
                  className="w-full rounded-xl border border-white/10 bg-[#0f1117] p-3 text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {confirmPassword &&
                  !passwordsMatch && (
                    <p className="mt-2 text-xs text-red-300">
                      Le password non
                      coincidono.
                    </p>
                  )}

                {confirmPassword &&
                  passwordsMatch &&
                  passwordValid && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-300">
                      <CheckCircle2
                        size={14}
                      />
                      Le password coincidono.
                    </p>
                  )}
              </div>

              {submitting && (
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-center text-sm text-indigo-300">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Registrazione e
                    accettazione in corso...
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Registrazione in corso..."
                  : "Registrati e accetta invito"}
              </button>

              <button
                type="button"
                onClick={goToLogin}
                disabled={submitting}
                className="w-full rounded-2xl border border-white/10 px-6 py-3 font-semibold text-gray-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ho già un account
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}