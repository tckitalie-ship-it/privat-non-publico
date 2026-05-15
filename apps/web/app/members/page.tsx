'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { API_URL, getAccessToken } from '@/lib/api';
import DashboardSidebar from '@/components/dashboard-sidebar';

type Membership = {
  id: string;
  role: string;
  user?: {
    id: string;
    email: string;
  };
  association?: {
    id: string;
    name: string;
  };
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  status?: string;
  createdAt: string;
  expiresAt: string;
};

export default function MembersPage() {
  const router = useRouter();

  const [members, setMembers] = useState<Membership[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviting, setInviting] = useState(false);
  const [deletingInvitationId, setDeletingInvitationId] =
    useState<string | null>(null);

  async function loadMembers() {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/memberships`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore caricamento membri');
      }

      setMembers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || 'Errore caricamento membri');
    }
  }

  async function loadInvitations() {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/invitations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore caricamento inviti');
      }

      setInvitations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || 'Errore caricamento inviti');
    }
  }

  async function loadPage() {
    setLoading(true);

    try {
      await Promise.all([loadMembers(), loadInvitations()]);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setInviting(true);

      const res = await fetch(`${API_URL}/api/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore invio invito');
      }

      setInviteEmail('');
      setInviteRole('MEMBER');

      toast.success('Invito inviato');

      await loadInvitations();
    } catch (err: any) {
      toast.error(err.message || 'Errore invio invito');
    } finally {
      setInviting(false);
    }
  }

  async function handleDeleteInvitation(id: string) {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setDeletingInvitationId(id);

      const res = await fetch(`${API_URL}/api/invitations/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore cancellazione invito');
      }

      toast.success('Invito cancellato');

      await loadInvitations();
    } catch (err: any) {
      toast.error(err.message || 'Errore cancellazione invito');
    } finally {
      setDeletingInvitationId(null);
    }
  }

  useEffect(() => {
    loadPage();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 p-8 lg:ml-72">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold">Membri</h1>

              <p className="mt-2 text-gray-400">
                Gestisci utenti, ruoli e inviti
              </p>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-xl border border-white/10 px-5 py-3 transition hover:bg-white/5"
            >
              Dashboard
            </button>
          </div>

          <section className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
              <p className="text-sm text-gray-400">Membri totali</p>

              <h2 className="mt-3 text-4xl font-bold">{members.length}</h2>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
              <p className="text-sm text-gray-400">Owner/Admin</p>

              <h2 className="mt-3 text-4xl font-bold">
                {members.filter((m) => m.role !== 'MEMBER').length}
              </h2>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
              <p className="text-sm text-gray-400">Inviti pendenti</p>

              <h2 className="mt-3 text-4xl font-bold">
                {invitations.length}
              </h2>
            </div>
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
            <h2 className="mb-4 text-2xl font-bold">Invita membro</h2>

            <form
              onSubmit={handleInvite}
              className="grid gap-4 md:grid-cols-[1fr_180px_160px]"
            >
              <input
                type="email"
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-indigo-500"
                required
              />

              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-indigo-500"
              >
                <option value="MEMBER">MEMBER</option>
                <option value="ADMIN">ADMIN</option>
              </select>

              <button
                type="submit"
                disabled={inviting}
                className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500 disabled:opacity-60"
              >
                {inviting ? 'Invio...' : 'Invita'}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
            <h2 className="mb-4 text-2xl font-bold">Membri attuali</h2>

            {loading && <p className="text-gray-400">Caricamento...</p>}

            {!loading && members.length === 0 && (
              <p className="text-gray-400">Nessun membro trovato.</p>
            )}

            {!loading && members.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-white/5">
                <table className="w-full text-left">
                  <thead className="bg-[#111827] text-sm text-gray-400">
                    <tr>
                      <th className="px-5 py-4">Email</th>
                      <th className="px-5 py-4">Ruolo</th>
                      <th className="px-5 py-4">Associazione</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-white/5">
                        <td className="px-5 py-4">
                          {member.user?.email || '-'}
                        </td>
                        <td className="px-5 py-4">{member.role}</td>
                        <td className="px-5 py-4">
                          {member.association?.name || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
            <h2 className="mb-4 text-2xl font-bold">Inviti</h2>

            {loading && <p className="text-gray-400">Caricamento...</p>}

            {!loading && invitations.length === 0 && (
              <p className="text-gray-400">Nessun invito pendente.</p>
            )}

            {!loading && invitations.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-white/5">
                <table className="w-full text-left">
                  <thead className="bg-[#111827] text-sm text-gray-400">
                    <tr>
                      <th className="px-5 py-4">Email</th>
                      <th className="px-5 py-4">Ruolo</th>
                      <th className="px-5 py-4">Stato</th>
                      <th className="px-5 py-4">Scadenza</th>
                      <th className="px-5 py-4 text-right">Azione</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {invitations.map((invitation) => (
                      <tr key={invitation.id} className="hover:bg-white/5">
                        <td className="px-5 py-4">{invitation.email}</td>
                        <td className="px-5 py-4">{invitation.role}</td>
                        <td className="px-5 py-4">
                          {invitation.status || 'PENDING'}
                        </td>
                        <td className="px-5 py-4">
                          {new Date(invitation.expiresAt).toLocaleDateString(
                            'it-IT',
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() =>
                              handleDeleteInvitation(invitation.id)
                            }
                            disabled={deletingInvitationId === invitation.id}
                            className="rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                          >
                            {deletingInvitationId === invitation.id
                              ? 'Cancello...'
                              : 'Cancella'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}