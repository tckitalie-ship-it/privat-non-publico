'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { API_URL, setAccessToken } from '@/lib/api';

type InvitationResponse = {
  email?: string;
  message?: string;
  valid?: boolean;
};

 type LoginResponse = {
  access_token?: string;
  accessToken?: string;
  token?: string;
  message?: string;
};

async function readResponse<T>(response: Response): Promise<T> {
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

export default function AcceptInviteContent({ token }: { token: string | null }) {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('Verifica invito...');
  const canSubmit =
  password.length >= 8 &&
  confirmPassword.length >= 8 &&
  password === confirmPassword &&
  !submitting;
  useEffect(() => {
    let cancelled = false;

    async function checkInvitation() {
      if (!token) {
        setError(true);
        setMessage('Token invito mancante.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/invitations/check/${encodeURIComponent(token)}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );

        const data = await readResponse<InvitationResponse>(response);

        if (!response.ok || data.valid === false) {
          throw new Error(data.message || 'Invito non valido o scaduto.');
        }

        if (!data.email) {
          throw new Error("Email dell'invito mancante.");
        }

        if (cancelled) {
          return;
        }

        setEmail(data.email);
        setError(false);
        setMessage('Crea il tuo account per accettare l’invito.');
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(true);
        setMessage(
          err instanceof Error
            ? err.message
            : 'Errore durante la verifica dell’invito.',
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

  async function registerAndAccept(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log('FORM INVIATO', {
  token,
  email,
  passwordLength: password.length,
  confirmPasswordLength: confirmPassword.length,
  passwordsMatch: password === confirmPassword,
});
    if (!token) {
      setError(true);
      setMessage('Token invito mancante.');
      return;
    }

    if (!email) {
      setError(true);
      setMessage("Email dell'invito mancante.");
      return;
    }

    if (password.length < 8) {
      setError(true);
      setMessage('La password deve contenere almeno 8 caratteri.');
      return;
    }

    if (password !== confirmPassword) {
      setError(true);
      setMessage('Le password non coincidono.');
      return;
    }

    setSubmitting(true);
    setError(false);
    setMessage('Registrazione e accettazione invito...');

    try {
      const registerResponse = await fetch(
        `${API_URL}/invitations/accept-and-register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            email,
            password,
          }),
        },
      );

      const registerData =
        await readResponse<InvitationResponse>(registerResponse);

      if (!registerResponse.ok) {
        throw new Error(
          registerData.message || 'Errore durante la registrazione.',
        );
      }

      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const loginData = await readResponse<LoginResponse>(loginResponse);

      const accessToken =
  loginData.accessToken ??
  loginData.access_token ??
  loginData.token;

if (!loginResponse.ok || !accessToken) {
  throw new Error(
    loginData.message ||
      'Registrazione completata, ma login automatico fallito.',
  );
}

setAccessToken(accessToken);
      localStorage.setItem('membershipUpdated', 'true');

      setMessage('Registrazione completata e invito accettato!');

      window.setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error
          ? err.message
          : 'Errore durante la registrazione.',
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f1117] p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1a1f2e] p-8 shadow-2xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-white">
          {error ? 'Errore' : 'Registrazione'}
        </h1>

        {loading && (
          <p className="text-center text-gray-300">{message}</p>
        )}

        {!loading && error && (
          <div className="text-center">
            <p className="text-sm text-red-300">{message}</p>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="mt-8 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500"
            >
              Vai al login
            </button>
          </div>
        )}

        {!loading && !error && (
          <form onSubmit={registerAndAccept}>
            <p className="mb-6 text-center text-sm text-gray-300">
              {message}
            </p>

            <label className="mb-2 block text-sm font-medium text-gray-200">
  Password
</label>

<input
  type="password"
  value={password}
  onChange={(event) => setPassword(event.target.value)}
  placeholder="Minimo 8 caratteri"
  autoComplete="new-password"
  minLength={8}
  required
  className="mb-4 w-full rounded-xl border border-white/10 bg-[#0f1117] p-3 text-white outline-none focus:border-indigo-500"
/>

<label className="mb-2 block text-sm font-medium text-gray-200">
  Conferma password
</label>

<input
  type="password"
  value={confirmPassword}
  onChange={(event) => setConfirmPassword(event.target.value)}
  placeholder="Ripeti la password"
  autoComplete="new-password"
  minLength={8}
  required
  className="mb-2 w-full rounded-xl border border-white/10 bg-[#0f1117] p-3 text-white outline-none focus:border-indigo-500"
/>

{password &&
  confirmPassword &&
  password !== confirmPassword && (
    <p className="mt-2 text-sm text-red-300">
      Le password non coincidono.
    </p>
  )}

<button
  type="submit"
  disabled={
    submitting ||
    password.length < 8 ||
    confirmPassword.length < 8 ||
    password !== confirmPassword
  }
  className="mt-6 w-full rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
>
  {submitting
    ? 'Registrazione in corso...'
    : 'Registrati e accetta invito'}
</button>

<button
  type="button"
  onClick={() => router.push('/login')}
  className="mt-3 w-full rounded-2xl border border-white/10 px-6 py-3 font-semibold text-gray-200 hover:bg-white/5"
>
  Ho già un account
</button>
          </form>
        )}
      </div>
    </main>
  );
}



