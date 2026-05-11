'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function MembersPage() {
  const router = useRouter();

  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

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

      setMembers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  return (
    <main className="min-h-screen bg-[#0f1117] p-8 text-white">
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
            <p className="text-sm text-gray-400">Member</p>
            <h2 className="mt-3 text-4xl font-bold">
              {members.filter((m) => m.role === 'MEMBER').length}
            </h2>
          </div>
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