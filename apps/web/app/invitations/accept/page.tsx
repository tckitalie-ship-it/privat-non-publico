'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_URL, setAccessToken } from '@/lib/api';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setMessage('Token mancante');
      setLoading(false);
      return;
    }

    async function verifyToken() {
      try {
        const res = await fetch(
          `${API_URL}/invitations/check/${token}`,
        );

        const data = await res.json();

        if (!res.ok) {
          setMessage(
            data.message || 'Invito non valido',
          );
          setLoading(false);
          return;
        }

        if (data.userExists) {
          setMessage(
            'Utente già esistente. Effettua il login.',
          );
          setLoading(false);
          return;
        }

        setEmail(data.email);
        setValid(true);
      } catch {
        setMessage(
          'Errore di connessione al server',
        );
      } finally {
        setLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (!token) return;

    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch(
        `${API_URL}/invitations/accept-register`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            token,
            password,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.message ||
            'Errore durante registrazione',
        );
        return;
      }

      setAccessToken(data.access_token);

      setMessage(
        'Registrazione completata!',
      );

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch {
      setMessage(
        'Errore di connessione al server',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Verifica invito...
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border p-6 text-center">
          <h1 className="mb-4 text-xl font-bold">
            Invito non disponibile
          </h1>

          <p>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          Accetta invito
        </h1>

        <p className="mb-6 text-sm text-slate-500">
          Sei stato invitato come:
        </p>

        <div className="mb-6 rounded-lg bg-slate-100 p-3 text-sm font-medium">
          {email}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value,
                )
              }
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          {message && (
            <div className="rounded-lg bg-slate-100 p-3 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white"
          >
            {submitting
              ? 'Registrazione...'
              : 'Crea account'}
          </button>
        </form>
      </div>
    </div>
  );
}