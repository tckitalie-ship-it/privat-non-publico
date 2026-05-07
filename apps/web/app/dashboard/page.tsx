'use client';

import { useEffect, useState } from 'react';

const API_URL = 'http://127.0.0.1:3001';

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
  const [data, setData] = useState<DashboardData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  async function requestJson(url: string, token: string) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await res.text();

    console.log('[DASHBOARD DEBUG]', url);
    console.log('[DASHBOARD DEBUG] status:', res.status);
    console.log('[DASHBOARD DEBUG] body:', text);

    let body: any = null;

    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!res.ok) {
      const message =
        typeof body === 'object' && body?.message
          ? Array.isArray(body.message)
            ? body.message.join(', ')
            : body.message
          : `Errore HTTP ${res.status}`;

      throw new Error(message);
    }

    return body;
  }

  async function load() {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('Devi effettuare il login');
      setLoading(false);
      return;
    }

    try {
      const [kpis, membership, memberships] = await Promise.all([
        requestJson(`${API_URL}/api/dashboard/kpis`, token),
        requestJson(`${API_URL}/api/memberships/me`, token),
        requestJson(`${API_URL}/api/memberships`, token),
      ]);

      setData({
        kpis,
        membership,
      });

      setMembers(Array.isArray(memberships) ? memberships : []);
    } catch (err: any) {
      console.error('[DASHBOARD ERROR]', err);
      setError(err.message || 'Errore nel caricamento della dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem('access_token');

    if (!token) {
      setInviteMessage('Devi effettuare il login');
      return;
    }

    setInviteLoading(true);
    setInviteMessage('');

    try {
      const res = await fetch(`${API_URL}/api/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: 'MEMBER',
        }),
      });

      const text = await res.text();
      const result = text ? JSON.parse(text) : null;

      console.log('[INVITE DEBUG] status:', res.status);
      console.log('[INVITE DEBUG] body:', result);

      if (!res.ok) {
        throw new Error(result?.message || 'Errore invito');
      }

      setInviteEmail('');
      setInviteMessage(`Invito creato per ${result.email}`);
      await load();
    } catch (err: any) {
      console.error('[INVITE ERROR]', err);
      setInviteMessage(err.message || 'Errore invito');
    } finally {
      setInviteLoading(false);
    }
  }

  async function changeRole(member: Member) {
    const token = localStorage.getItem('access_token');

    if (!token) {
      alert('Devi effettuare il login');
      return;
    }

    const newRole = member.role === 'MEMBER' ? 'ADMIN' : 'MEMBER';

    try {
      const res = await fetch(`${API_URL}/api/memberships/${member.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const text = await res.text();

      console.log('[CHANGE ROLE DEBUG] status:', res.status);
      console.log('[CHANGE ROLE DEBUG] body:', text);

      if (!res.ok) {
        throw new Error('Errore cambio ruolo');
      }

      await load();
    } catch (err: any) {
      console.error('[CHANGE ROLE ERROR]', err);
      alert(err.message || 'Errore cambio ruolo');
    }
  }

  async function removeMember(member: Member) {
    const token = localStorage.getItem('access_token');

    if (!token) {
      alert('Devi effettuare il login');
      return;
    }

    if (!confirm(`Rimuovere ${member.user.email}?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/memberships/${member.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();

      console.log('[REMOVE MEMBER DEBUG] status:', res.status);
      console.log('[REMOVE MEMBER DEBUG] body:', text);

      if (!res.ok) {
        throw new Error('Errore rimozione membro');
      }

      await load();
    } catch (err: any) {
      console.error('[REMOVE MEMBER ERROR]', err);
      alert(err.message || 'Errore rimozione membro');
    }
  }

  async function handleCheckout() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      alert('Devi effettuare il login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      const checkout = text ? JSON.parse(text) : null;

      console.log('[CHECKOUT DEBUG] status:', res.status);
      console.log('[CHECKOUT DEBUG] body:', checkout);

      if (!res.ok) {
        throw new Error(checkout?.message || 'Errore checkout');
      }

      if (!checkout?.url) {
        throw new Error('URL checkout mancante');
      }

      window.location.href = checkout.url;
    } catch (err: any) {
      console.error('[CHECKOUT ERROR]', err);
      alert(err.message || 'Errore checkout');
    }
  }

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
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Cruscotto</h1>

      <div className="bg-white shadow rounded-xl p-5">
        <h2 className="text-xl font-semibold">
          {data?.membership.association.name}
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Ruolo: <strong>{data?.membership.role}</strong>
        </p>

        <p className="text-gray-500 text-sm">
          Stato:{' '}
          {data?.membership.association.isActive ? '🟢 Attiva' : '🔴 Disattiva'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-gray-500 text-sm">Membri</p>
          <p className="text-xl font-bold">{data?.kpis.membersCount ?? 0}</p>
        </div>

        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-gray-500 text-sm">Eventi</p>
          <p className="text-xl font-bold">{data?.kpis.eventsCount ?? 0}</p>
        </div>

        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-gray-500 text-sm">Saldo</p>
          <p className="text-xl font-bold">
            € {((data?.kpis.balanceCents ?? 0) / 100).toFixed(2)}
          </p>
        </div>
      </div>
    </main>
  );
}