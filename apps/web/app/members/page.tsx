'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { API_URL, getAccessToken } from '@/lib/api';

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
  const [deletingInvitationId, setDeletingInvitationId] = useState<string | null>(null);

  async function loadMembers() {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/memberships`, {
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
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
        if (data.message === 'Invitation already exists') {
          throw new Error('Esiste già un invito pendente per questa email');
        }

        if (data.message === 'User is already a member') {
          throw new Error('Questo utente è già membro');
        }

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
    <main className="min-h-screen bg-[#0f1117] p-8 text-white lg:ml-72">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold">Membri</h1>
            <p className="mt-2 text-gray-400">
              Gestisci utenti, ruoli e appartenenze
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-xl border border-white/10 px-5 py-3 hover:bg-white/5"
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
            <h2 className="mt-3 text-4xl font-bold">{invitations.length}</h2>
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
          <h2 className="mb-6 text-2xl font-bold">Inviti pendenti</h2>

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
                    <th className="px-5 py-4">Scadenza</th>
                    <th className="px-5 py-4">Stato</th>
                    <th className="px-5 py-4 text-right">Azione</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {invitations.map((invitation) => (
                    <tr key={invitation.id} className="hover:bg-white/5">
                      <td className="px-5 py-4 font-semibold">
                        {invitation.email}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-indigo-600/20 px-3 py-1 text-sm text-indigo-300">
                          {invitation.role}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-gray-300">
                        {new Date(invitation.expiresAt).toLocaleDateString('it-IT')}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-yellow-600/20 px-3 py-1 text-sm text-yellow-300">
                          {invitation.status || 'PENDING'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteInvitation(invitation.id)}
                          disabled={deletingInvitationId === invitation.id}
                          className="rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
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

        <section className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
          <h2 className="mb-6 text-2xl font-bold">Tabella membri</h2>

          {loading && <p className="text-gray-400">Caricamento...</p>}

          {!loading && members.length === 0 && (
            <p className="text-gray-400">Nessun membro trovato.</p>
          )}

          {!loading && members.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-white/5">
              <table className="w-full text-left">
                <thead className="bg-[#111827] text-sm text-gray-400">
                  <tr>
                    <th className="px-5 py-4">Utente</th>
                    <th className="px-5 py-4">Associazione</th>
                    <th className="px-5 py-4">Ruolo</th>
                    <th className="px-5 py-4">Stato</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-white/5">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold">
                            {(member.user?.email || 'U')[0].toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold">
                              {member.user?.email || 'Utente'}
                            </p>
                            <p className="text-sm text-gray-400">
                              ID: {member.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-300">
                        {member.association?.name || 'Associazione'}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-indigo-600/20 px-3 py-1 text-sm text-indigo-300">
                          {member.role}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-emerald-600/20 px-3 py-1 text-sm text-emerald-300">
                          Attivo
                        </span>
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
  );
}