'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { API_URL, getAccessToken, setAccessToken } from '@/lib/api';

type AssociationItem = {
  id?: string;
  associationId?: string;
  name?: string;
  role?: string;
  association?: {
    id: string;
    name: string;
  };
};

export default function AssociationSwitcher() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [associations, setAssociations] = useState<AssociationItem[]>([]);
  const [activeAssociationId, setActiveAssociationId] = useState('');

  useEffect(() => {
    async function loadAssociations() {
      const token = getAccessToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const me = meRes.ok ? await meRes.json() : null;

        if (me?.associationId) {
          setActiveAssociationId(me.associationId);
        }

        const res = await fetch(`${API_URL}/associations/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Errore caricamento associazioni');
        }

        const data = await res.json();

        setAssociations(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error(error);
        toast.error('Impossibile caricare le associazioni');
      } finally {
        setLoading(false);
      }
    }

    loadAssociations();
  }, []);

  async function handleSwitch(associationId: string) {
    const token = getAccessToken();

    if (!token || !associationId || associationId === activeAssociationId) {
      return;
    }

    try {
      setSwitching(true);

      const res = await fetch(`${API_URL}/auth/switch-association`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          associationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Cambio associazione fallito');
      }

      setAccessToken(data.access_token);
      setActiveAssociationId(associationId);

      toast.success('Associazione cambiata');

      router.refresh();
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Errore cambio associazione');
    } finally {
      setSwitching(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-gray-400">
        Caricamento associazioni...
      </div>
    );
  }

  if (associations.length <= 1) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-400">
        Associazione attiva
      </label>

      <select
        value={activeAssociationId}
        disabled={switching}
        onChange={(e) => handleSwitch(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500 disabled:opacity-60"
      >
        <option value="" disabled>
          Seleziona associazione
        </option>

        {associations.map((item) => {
          const id = item.association?.id || item.associationId || item.id || '';
          const name = item.association?.name || item.name || 'Associazione';

          return (
            <option key={id} value={id}>
              {name}
            </option>
          );
        })}
      </select>
    </div>
  );
}