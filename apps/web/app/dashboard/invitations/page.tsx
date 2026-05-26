'use client';

import Link from 'next/link';
import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  Mail,
  Plus,
  Shield,
} from 'lucide-react';

import { toast } from 'sonner';

import { getAccessToken } from '@/lib/api';

import DashboardSidebar from '@/components/dashboard-sidebar';

type Invitation = {
  id: string;
  email: string;
  role: string;
  token: string;
  acceptedAt?: string | null;
  createdAt?: string;
};

export default function InvitationsPage() {
  const [invitations, setInvitations] =
    useState<Invitation[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [loadingInvitations,
    setLoadingInvitations] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [email, setEmail] =
    useState('');

  const [role, setRole] =
    useState('MEMBER');

  async function loadInvitations() {
    try {
      setLoadingInvitations(true);

      const token =
        getAccessToken();

      const res = await fetch(
        '/api/invitations',
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        },
      );

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();

      setInvitations(
        Array.isArray(data)
          ? data
          : [],
      );
    } catch (error) {
      console.error(error);

      toast.error(
        'Errore caricamento inviti',
      );
    } finally {
      setLoadingInvitations(false);
    }
  }

  useEffect(() => {
    loadInvitations();
  }, []);

  async function handleCreateInvitation(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      const token =
        getAccessToken();

      const res = await fetch(
        '/api/invitations',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            email,
            role,
          }),
        },
      );

      if (!res.ok) {
        throw new Error();
      }

      setEmail('');
      setRole('MEMBER');
      setShowForm(false);

      await loadInvitations();

      toast.success(
        'Invito creato',
      );
    } catch (error) {
      console.error(error);

      toast.error(
        'Errore creazione invito',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 px-6 py-8 md:ml-72">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
            >
              ← Dashboard
            </Link>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-[#111827] p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold">
                  Invitations
                </h1>

                <p className="mt-3 text-zinc-400">
                  Invita membri nella tua associazione.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(
                    (value) =>
                      !value,
                  )
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                <Plus className="h-5 w-5" />
                Nuovo invito
              </button>
            </div>
          </section>

          {showForm && (
            <form
              onSubmit={
                handleCreateInvitation
              }
              className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value,
                    )
                  }
                  type="email"
                  placeholder="Email membro"
                  required
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3"
                />

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(
                      e.target.value,
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3"
                >
                  <option value="MEMBER">
                    MEMBER
                  </option>

                  <option value="ADMIN">
                    ADMIN
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-5 rounded-2xl bg-white px-5 py-3 font-semibold text-zinc-950"
              >
                {loading
                  ? 'Invio...'
                  : 'Invita membro'}
              </button>
            </form>
          )}

          <section className="mt-8">
            {loadingInvitations ? (
              <div className="rounded-3xl border border-white/10 bg-[#111827] p-10 text-center text-zinc-400">
                Caricamento inviti...
              </div>
            ) : invitations.length ===
              0 ? (
              <div className="rounded-3xl border border-white/10 bg-[#111827] p-10 text-center text-zinc-500">
                Nessun invito trovato.
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map(
                  (invitation) => (
                    <div
                      key={
                        invitation.id
                      }
                      className="rounded-3xl border border-white/10 bg-[#111827] p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-indigo-300" />

                            <h3 className="font-semibold">
                              {
                                invitation.email
                              }
                            </h3>
                          </div>

                          <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
                            <Shield className="h-4 w-4 text-cyan-300" />

                            {
                              invitation.role
                            }
                          </div>

                          <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b1220] p-4">
                            <p className="text-xs text-zinc-500">
                              Token invito
                            </p>

                            <p className="mt-2 break-all text-sm text-zinc-300">
                              {
                                invitation.token
                              }
                            </p>
                          </div>
                        </div>

                        <div
                          className={
                            invitation.acceptedAt
                              ? 'rounded-2xl bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300'
                              : 'rounded-2xl bg-yellow-500/20 px-4 py-2 text-sm font-semibold text-yellow-300'
                          }
                        >
                          {invitation.acceptedAt
                            ? 'Accettato'
                            : 'In attesa'}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}