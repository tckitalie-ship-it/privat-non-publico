'use client';

import Link from 'next/link';

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Mail,
  Plus,
  Shield,
  Crown,
  Search,
  Trash2,
} from 'lucide-react';

import { API_URL, getAccessToken } from '@/lib/api';

import DashboardSidebar from '@/components/dashboard-sidebar';

type Membership = {
  id: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
  };
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

function getInitials(email: string) {
  const name = email.split('@')[0] || 'user';

  return name
    .split(/[._-]/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getRoleColor(role: string) {
  if (role === 'OWNER') {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
  }

  if (role === 'ADMIN') {
    return 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300';
  }

  return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
}

export default function MembersPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [members, setMembers] = useState<Membership[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  useEffect(() => {
    fetchMembers();
    fetchInvitations();
  }, []);

  async function fetchMembers() {
    try {
      setLoadingMembers(true);

      const token = getAccessToken();

      if (!token) {
        setMembers([]);
        return;
      }

      const res = await fetch(`${API_URL}/memberships`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Errore caricamento membri');
      }

      const data = await res.json();

      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }

  async function fetchInvitations() {
    try {
      setLoadingInvitations(true);

      const token = getAccessToken();

      if (!token) {
        setInvitations([]);
        return;
      }

      const res = await fetch(`${API_URL}/invitations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Errore caricamento inviti');
      }

      const data = await res.json();

      setInvitations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setInvitations([]);
    } finally {
      setLoadingInvitations(false);
    }
  }

  async function handleInvite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim()) return;

    try {
      setLoading(true);

      const token = getAccessToken();

      if (!token) return;

      const res = await fetch(`${API_URL}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          role,
        }),
      });

      if (!res.ok) {
        throw new Error('Errore invito membro');
      }

      setEmail('');
      setRole('MEMBER');

      await fetchMembers();
      await fetchInvitations();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function removeMember(id: string) {
    try {
      const token = getAccessToken();

      if (!token) return;

      const res = await fetch(`${API_URL}/memberships/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Errore rimozione membro');
      }

      await fetchMembers();
    } catch (error) {
      console.error(error);
    }
  }

  async function removeInvitation(id: string) {
    try {
      const token = getAccessToken();

      if (!token) return;

      const res = await fetch(`${API_URL}/invitations/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Errore rimozione invito');
      }

      await fetchInvitations();
    } catch (error) {
      console.error(error);
    }
  }

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch = member.user.email
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesRole =
        roleFilter === 'ALL' || member.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [members, search, roleFilter]);

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

          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827] p-8 shadow-2xl">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative">
              <p className="mb-3 inline-flex rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
                Team management
              </p>

              <h1 className="text-5xl font-bold">Members</h1>

              <p className="mt-3 max-w-2xl text-gray-400">
                Gestisci membri reali, ruoli e inviti della piattaforma.
              </p>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-4">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <p className="text-sm text-indigo-300">Membri totali</p>
              <h2 className="mt-4 text-4xl font-bold">
                {loadingMembers ? '...' : members.length}
              </h2>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <p className="text-sm text-emerald-300">Member</p>
              <h2 className="mt-4 text-4xl font-bold">
                {loadingMembers
                  ? '...'
                  : members.filter((member) => member.role === 'MEMBER')
                      .length}
              </h2>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-amber-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <p className="text-sm text-amber-300">Admin / Owner</p>
              <h2 className="mt-4 text-4xl font-bold">
                {loadingMembers
                  ? '...'
                  : members.filter(
                      (member) =>
                        member.role === 'ADMIN' || member.role === 'OWNER',
                    ).length}
              </h2>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <p className="text-sm text-cyan-300">Inviti pending</p>
              <h2 className="mt-4 text-4xl font-bold">
                {loadingInvitations ? '...' : invitations.length}
              </h2>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-2xl">
            <h2 className="text-2xl font-bold">Nuovo invito</h2>

            <form onSubmit={handleInvite} className="mt-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Email membro
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111827] px-4">
                    <Mail className="h-5 w-5 text-indigo-300" />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="membro@email.com"
                      required
                      className="w-full bg-transparent py-4 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Ruolo
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111827] px-4">
                    <Shield className="h-5 w-5 text-emerald-300" />

                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-transparent py-4 outline-none"
                    >
                      <option value="MEMBER" className="bg-[#111827]">
                        MEMBER
                      </option>

                      <option value="ADMIN" className="bg-[#111827]">
                        ADMIN
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500 disabled:opacity-60"
              >
                <Plus className="h-5 w-5" />
                {loading ? 'Invio...' : 'Invia invito'}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Inviti pending</h2>

                <p className="mt-2 text-sm text-gray-400">
                  Inviti non ancora accettati
                </p>
              </div>

              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-indigo-300">
                {loadingInvitations ? '...' : invitations.length} pending
              </div>
            </div>

            {loadingInvitations ? (
              <div className="mt-6 h-32 animate-pulse rounded-2xl bg-[#111827]" />
            ) : invitations.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-[#111827] p-8 text-center text-gray-400">
                Nessun invito pending
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="rounded-2xl border border-white/10 bg-[#111827] p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {invitation.email}
                        </h3>

                        <p className="mt-2 text-sm text-gray-400">
                          Invitato il{' '}
                          {new Date(invitation.createdAt).toLocaleString(
                            'it-IT',
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-sm font-medium ${getRoleColor(
                            invitation.role,
                          )}`}
                        >
                          {invitation.role}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeInvitation(invitation.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Annulla
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-2xl">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Membri reali</h2>

                <p className="mt-2 text-sm text-gray-400">
                  Lista membri caricata dal backend
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111827] px-4">
                  <Search className="h-5 w-5 text-gray-500" />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cerca membro..."
                    className="bg-transparent py-3 outline-none"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
                >
                  <option value="ALL" className="bg-[#111827]">
                    Tutti i ruoli
                  </option>
                  <option value="MEMBER" className="bg-[#111827]">
                    MEMBER
                  </option>
                  <option value="ADMIN" className="bg-[#111827]">
                    ADMIN
                  </option>
                  <option value="OWNER" className="bg-[#111827]">
                    OWNER
                  </option>
                </select>
              </div>
            </div>

            {loadingMembers ? (
              <div className="mt-8 h-40 animate-pulse rounded-3xl bg-[#111827]" />
            ) : filteredMembers.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-[#111827] p-12 text-center text-gray-400">
                Nessun membro trovato
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-2xl border border-white/10 bg-[#111827] p-5 transition hover:border-indigo-500/40"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-lg font-bold text-white shadow-lg shadow-indigo-950/40">
                          {getInitials(member.user.email)}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">
                              {member.user.email}
                            </h3>

                            {member.role === 'OWNER' && (
                              <Crown className="h-4 w-4 text-amber-300" />
                            )}
                          </div>

                          <p className="mt-2 text-sm text-gray-400">
                            Creato il{' '}
                            {new Date(member.createdAt).toLocaleString(
                              'it-IT',
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-sm font-medium ${getRoleColor(
                            member.role,
                          )}`}
                        >
                          {member.role}
                        </span>

                        {member.role !== 'OWNER' && (
                          <button
                            type="button"
                            onClick={() => removeMember(member.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            Rimuovi
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}