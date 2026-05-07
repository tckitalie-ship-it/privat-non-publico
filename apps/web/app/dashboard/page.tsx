'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  API_URL,
  clearAccessToken,
  getAccessToken,
} from '../../lib/api';

type DashboardData = {
  membership: {
    role: string;
    association: {
      name: string;
      isActive: boolean;
    };
  };
  kpis: {
    membersCount: number;
    eventsCount: number;
    incomeCents: number;
    expenseCents: number;
    balanceCents: number;
  };
};

type Member = {
  id: string;
  role: string;
  user: {
    email: string;
  };
};

export default function DashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function logout() {
    clearAccessToken();
    router.push('/login');
  }

  async function requestJson(url: string, token: string) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await res.text();
    const body = text ? JSON.parse(text) : null;

    if (!res.ok) {
      throw new Error(body?.message || `Errore HTTP ${res.status}`);
    }

    return body;
  }

  async function load() {
    setLoading(true);
    setError('');

    const token = getAccessToken();

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const kpis = await requestJson(
        `${API_URL}/api/dashboard/kpis`,
        token,
      );

      const membership = await requestJson(
        `${API_URL}/api/memberships/me`,
        token,
      );

      const memberships = await requestJson(
        `${API_URL}/api/memberships`,
        token,
      );

      setData({
        kpis,
        membership,
      });

      setMembers(Array.isArray(memberships) ? memberships : []);
    } catch (err: any) {
      setError(
        err.message || 'Errore nel caricamento dashboard',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <main className="p-10 text-center text-gray-500">
        Caricamento dashboard...
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-10 text-center space-y-4">
        <p className="text-red-600 font-medium">{error}</p>

        <button
          onClick={load}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Riprova
        </button>

        <button
          onClick={logout}
          className="block mx-auto border px-4 py-2 rounded"
        >
          Torna al login
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Cruscotto
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => router.push('/events')}
            className="border px-3 py-2 rounded text-sm"
          >
            Eventi
          </button>

          <button
            onClick={logout}
            className="border px-3 py-2 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-5">
        <h2 className="text-xl font-semibold">
          {data?.membership.association.name}
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Ruolo:{' '}
          <strong>{data?.membership.role}</strong>
        </p>

        <p className="text-gray-500 text-sm">
          Stato:{' '}
          {data?.membership.association.isActive
            ? '🟢 Attiva'
            : '🔴 Disattiva'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-gray-500 text-sm">
            Membri
          </p>

          <p className="text-xl font-bold">
            {data?.kpis.membersCount ?? 0}
          </p>
        </div>

        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-gray-500 text-sm">
            Eventi
          </p>

          <p className="text-xl font-bold">
            {data?.kpis.eventsCount ?? 0}
          </p>
        </div>

        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-gray-500 text-sm">
            Saldo
          </p>

          <p className="text-xl font-bold">
            €
            {(
              (data?.kpis.balanceCents ?? 0) / 100
            ).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">
            Membri
          </h2>

          <span className="text-sm text-gray-500">
            {members.length} totali
          </span>
        </div>

        {members.length === 0 && (
          <p className="text-sm text-gray-500">
            Nessun membro trovato.
          </p>
        )}

        {members.map((member) => (
          <div
            key={member.id}
            className="flex justify-between items-center border rounded p-3"
          >
            <div>
              <p className="font-medium">
                {member.user.email}
              </p>

              <p className="text-sm text-gray-500">
                {member.role}
              </p>
            </div>

            <span className="text-xs border px-2 py-1 rounded">
              {member.role}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}