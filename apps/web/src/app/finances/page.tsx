'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL, getAccessToken } from '@/lib/api';
import { DashboardSidebar } from '@/components/dashboard-sidebar';

type DashboardKpis = {
  associations: number;
  members: number;
  events: number;
  revenueCents: number;
};

type Membership = {
  id: string;
  role: string;
  association: {
    id: string;
    name: string;
  };
};

export default function DashboardPage() {
  const router = useRouter();

  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviteMessage, setInviteMessage] = useState('');

  async function loadDashboard() {
    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const [kpiRes, membershipsRes] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/kpis`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_URL}/api/memberships`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (kpiRes.status === 401 || membershipsRes.status === 401) {
        router.push('/login');
        return;
      }

      const kpiData = await kpiRes.json();
      const membershipsData = await membershipsRes.json();

      setKpis(kpiData);
      setMemberships(Array.isArray(membershipsData) ? membershipsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
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
        throw new Error(data.message || 'Errore invito');
      }

      setInviteEmail('');
      setInviteRole('MEMBER');
      setInviteMessage('Invito creato con successo');

      await loadDashboard();
    } catch (err: any) {
      setInviteMessage(err.message || 'Errore invito');
    }
  }

  if (loading) {
    return (
      <main className="p-10">
        <p>Caricamento dashboard...</p>
      </main>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <DashboardSidebar />

      <main className="flex-1 p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Gestisci associazione, eventi e finanze
          </p>
        </div>

        <section className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500">
              Associazioni
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {kpis?.associations ?? 0}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500">
              Membri
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {kpis?.members ?? 0}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500">
              Eventi
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {kpis?.events ?? 0}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500">
              Entrate
            </p>

            <h2 className="text-3xl font-bold mt-2">
              €
              {((kpis?.revenueCents ?? 0) / 100).toFixed(2)}
            </h2>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold">
              Membri associazione
            </h2>

            <button
              onClick={() => router.push('/events')}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Vai agli eventi
            </button>
          </div>

          <div className="space-y-3">
            {memberships.map((membership) => (
              <div
                key={membership.id}
                className="border rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {membership.association.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {membership.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-5">
            Invita membro
          </h2>

          <form
            onSubmit={handleInvite}
            className="space-y-4"
          >
            {inviteMessage && (
              <div className="bg-gray-100 rounded-lg p-3 text-sm">
                {inviteMessage}
              </div>
            )}

            <input
              type="email"
              placeholder="Email membro"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3"
              required
            />

            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full border rounded-lg px-4 py-3"
            >
              <option value="MEMBER">
                MEMBER
              </option>

              <option value="ADMIN">
                ADMIN
              </option>
            </select>

            <button
              type="submit"
              className="bg-black text-white px-5 py-3 rounded-lg"
            >
              Invita
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}