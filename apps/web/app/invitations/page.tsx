'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

import DashboardSidebar from '@/components/dashboard-sidebar';

type Invitation = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

const STORAGE_KEY = 'demo-invitations';

export default function InvitationsPage() {
  const [email, setEmail] =
    useState('');

  const [role, setRole] =
    useState('MEMBER');

  const [invitations, setInvitations] =
    useState<Invitation[]>([]);

  useEffect(() => {
    const saved =
      localStorage.getItem(
        STORAGE_KEY,
      );

    if (saved) {
      try {
        setInvitations(
          JSON.parse(saved),
        );
      } catch {
        setInvitations([]);
      }
    }
  }, []);

  function saveInvitations(
    updated: Invitation[],
  ) {
    setInvitations(updated);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated),
    );
  }

  function handleInvite(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!email.trim()) return;

    const newInvite: Invitation = {
      id: crypto.randomUUID(),
      email,
      role,
      createdAt:
        new Date().toISOString(),
    };

    saveInvitations([
      newInvite,
      ...invitations,
    ]);

    setEmail('');
    setRole('MEMBER');
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 p-8 lg:ml-72">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
            >
              ← Dashboard
            </Link>
          </div>

          <div>
            <p className="text-sm font-medium text-indigo-400">
              Team management
            </p>

            <h1 className="mt-2 text-5xl font-bold">
              Invita membri
            </h1>

            <p className="mt-3 max-w-2xl text-gray-400">
              Gestisci inviti demo
              persistenti localmente.
            </p>
          </div>

          <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-2xl">
            <h2 className="text-2xl font-bold">
              Nuovo invito
            </h2>

            <form
              onSubmit={handleInvite}
              className="mt-6 space-y-5"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value,
                    )
                  }
                  placeholder="membro@email.com"
                  required
                  className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-4 outline-none focus:border-indigo-500"
                />

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(
                      e.target.value,
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-4 outline-none focus:border-indigo-500"
                >
                  <option value="MEMBER">
                    MEMBER
                  </option>

                  <option value="ADMIN">
                    ADMIN
                  </option>

                  <option value="OWNER">
                    OWNER
                  </option>
                </select>
              </div>

              <button
                type="submit"
                className="rounded-2xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500"
              >
                Invia invito
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-2xl">
            <h2 className="text-2xl font-bold">
              Inviti inviati
            </h2>

            {invitations.length ===
            0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-[#111827] p-12 text-center text-gray-400">
                Nessun invito inviato
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {invitations.map(
                  (invite) => (
                    <div
                      key={invite.id}
                      className="rounded-2xl border border-white/10 bg-[#111827] p-5"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {
                              invite.email
                            }
                          </h3>

                          <p className="mt-1 text-sm text-gray-400">
                            Invitato il{' '}
                            {new Date(
                              invite.createdAt,
                            ).toLocaleString(
                              'it-IT',
                            )}
                          </p>
                        </div>

                        <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
                          {invite.role}
                        </span>
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