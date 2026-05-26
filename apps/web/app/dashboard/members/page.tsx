'use client';

import { useEffect, useState } from 'react';

type Membership = {
  id: string;
  role: string;
  createdAt: string;
  user?: {
    email?: string;
  };
};

export default function MembersPage() {
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMembers() {
      try {
        const token = localStorage.getItem('access_token');

        if (!token) {
          window.location.href = '/login';
          return;
        }

        const response = await fetch('/api/memberships', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Errore caricamento membri');
        }

        setMembers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore membri');
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, []);

  return (
    <main className="min-h-screen bg-[#090D14] px-8 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">Dashboard</p>
            <h1 className="mt-2 text-4xl font-bold">Members</h1>
            <p className="mt-2 text-zinc-400">
              Gestisci i membri della tua associazione.
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10"
          >
            Torna dashboard
          </a>
        </div>

        {loading && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-zinc-400">
            Caricamento membri...
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Ruolo</th>
                  <th className="px-6 py-4">Creato</th>
                </tr>
              </thead>

              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="px-6 py-4">
                      {member.user?.email || 'Utente'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

                {members.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-zinc-500"
                    >
                      Nessun membro trovato.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
