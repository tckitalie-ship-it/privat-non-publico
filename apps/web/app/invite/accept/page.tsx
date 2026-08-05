'use client';

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from 'react';
import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  API_URL,
  getAccessToken,
} from '@/lib/api';

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  acceptedAt: string | null;
  associationId: string;
  association?: {
    name?: string;
  };
};

type ApiError = {
  message?: string | string[];
};

function getErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data
  ) {
    const message = (data as ApiError).message;

    if (typeof message === 'string') {
      return message;
    }

    if (Array.isArray(message)) {
      return message.join(', ');
    }
  }

  return fallback;
}

async function readResponse(
  response: Response,
): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  const [invitation, setInvitation] =
    useState<Invitation | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadInvitation() {
      if (!token) {
        setError('Token dell’invito mancante.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/invitations/check/${encodeURIComponent(
            token,
          )}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );

        const data = await readResponse(response);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              data,
              'Invito non valido o scaduto.',
            ),
          );
        }

        if (!cancelled) {
          setInvitation(data as Invitation);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Impossibile controllare l’invito.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInvitation();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function acceptExistingAccount() {
    if (!token) {
      setError('Token dell’invito mancante.');
      return;
    }

    const accessToken = getAccessToken();

    if (!accessToken) {
      setError(
        'Nessuna sessione attiva. Effettua il login e riapri il link dell’invito.',
      );
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `${API_URL}/invitations/accept/${encodeURIComponent(
          token,
        )}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            'Impossibile accettare l’invito.',
          ),
        );
      }

      localStorage.setItem(
        'membershipUpdated',
        'true',
      );

      setSuccess('Invito accettato con successo.');

      window.setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Errore durante l’accettazione.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function registerAndAccept(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token || !invitation) {
      setError('Invito non disponibile.');
      return;
    }

    if (password.length < 8) {
      setError(
        'La password deve contenere almeno 8 caratteri.',
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Le password non coincidono.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `${API_URL}/invitations/accept-and-register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            token,
            email: invitation.email,
            password,
          }),
        },
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            'Registrazione non riuscita.',
          ),
        );
      }

      setSuccess(
        'Registrazione completata e invito accettato.',
      );

      window.setTimeout(() => {
        router.push('/login');
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Errore durante la registrazione.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f1117] p-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1a1f2e] p-8 text-center shadow-2xl">
          <h1 className="mb-3 text-2xl font-bold text-white">
            Controllo invito
          </h1>

          <p className="text-gray-300">
            Attendere...
          </p>
        </div>
      </main>
    );
  }

  if (error && !invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f1117] p-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1a1f2e] p-8 text-center shadow-2xl">
          <h1 className="mb-3 text-2xl font-bold text-white">
            Invito non disponibile
          </h1>

          <p className="text-red-300">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f1117] p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1a1f2e] p-8 shadow-2xl">
        <h1 className="mb-2 text-3xl font-bold text-white">
          Accetta l’invito
        </h1>

        <p className="mb-6 text-sm text-gray-300">
          Sei stato invitato a entrare in{' '}
          <strong className="text-white">
            {invitation.association?.name ??
              'questa associazione'}
          </strong>{' '}
          con il ruolo{' '}
          <strong className="text-white">
            {invitation.role}
          </strong>
          .
        </p>

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form
          onSubmit={registerAndAccept}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-200"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={invitation.email}
              readOnly
              className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-3 py-3 text-white"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-200"
            >
              Crea una password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              minLength={8}
              autoComplete="new-password"
              required
              placeholder="Almeno 8 caratteri"
              className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-3 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-gray-200"
            >
              Conferma password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              minLength={8}
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-white/10 bg-[#0f1117] px-3 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || Boolean(success)}
            className="w-full rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? 'Registrazione in corso...'
              : 'Registrati e accetta invito'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />

          <span className="text-sm text-gray-500">
            oppure
          </span>

          <div className="h-px flex-1 bg-white/10" />
        </div>

        <p className="mb-3 text-center text-sm text-gray-400">
          Hai già un account e hai già effettuato
          l’accesso?
        </p>

        <button
          type="button"
          onClick={() =>
            void acceptExistingAccount()
          }
          disabled={submitting || Boolean(success)}
          className="w-full rounded-2xl border border-white/10 px-6 py-3 font-semibold text-gray-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Accetta con account esistente
        </button>
      </div>
    </main>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0f1117] text-white">
          Caricamento...
        </main>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}