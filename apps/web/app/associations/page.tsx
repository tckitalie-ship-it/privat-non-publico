'use client';
import { API_URL, getAccessToken } from "@/lib/api";
import Link from 'next/link';
import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  Building2,
  Plus,
  Users,
  CalendarDays,
  Settings,
  Trash2,
} from 'lucide-react';

import DashboardSidebar from '@/components/dashboard-sidebar';

type Association = {
  id: string;
  name: string;
  description: string;
  status: 'Attiva' | 'In pausa';
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  plan: 'Starter' | 'Pro' | 'Enterprise';
  createdAt: string;
};

type Membership = {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
};

type Event = {
  id: string;
};

type AssociationWithRelations = Association & {
  memberships?: Membership[];
  events?: Event[];
};

export default function AssociationsPage() {
  const [associations, setAssociations] = useState<AssociationWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const token = getAccessToken();

if (!token) {
  throw new Error("Sessione non disponibile");
}

const res = await fetch(`${API_URL}/associations`, {
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
  cache: "no-store",
});
        const data = await res.json();

        console.log('ASSOCIATIONS DATA:', data);

        if (Array.isArray(data)) {
          setAssociations(data as AssociationWithRelations[]);
        } else {
          console.warn("API /associations ha restituito un valore non-array:", data);
          setAssociations([]);
        }

      } catch (err) {
        console.error('Errore caricamento associazioni:', err);
        setAssociations([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

   async function handleCreate(
  e: FormEvent<HTMLFormElement>,
) {
  e.preventDefault();

  const token = getAccessToken();

  if (!token) {
    alert("Sessione non disponibile");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/associations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Errore creazione associazione");
    }

    const created = await response.json();

    setAssociations((current) => [
      ...current,
      created,
    ]);

    setShowForm(false);
    setName("");
    setDescription("");
  } catch (error) {
    console.error(error);
    alert("Impossibile creare l'associazione");
  }
}

  async function deleteAssociation(id: string) {
  const confirmed = window.confirm(
    "Vuoi davvero eliminare questa associazione?",
  );

  if (!confirmed) {
    return;
  }

  const token = getAccessToken();

  if (!token) {
    alert("Sessione non disponibile");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/associations/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Errore eliminazione associazione (${response.status})`,
      );
    }

    setAssociations((current) =>
      current.filter(
        (association) => association.id !== id,
      ),
    );
  } catch (error) {
    console.error(
      "Errore eliminazione associazione:",
      error,
    );

    alert(
      error instanceof Error
        ? error.message
        : "Impossibile eliminare l'associazione",
    );
  }
}

  if (loading) {
    return (
      <div className="p-8 text-white">
        Caricamento associazioni…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 p-8 md:ml-72">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
            >
              ← Dashboard
            </Link>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-400">
                Workspace
              </p>

              <h1 className="mt-2 text-5xl font-bold">
                Associazioni
              </h1>

              <p className="mt-3 max-w-2xl text-gray-400">
                Gestisci le associazioni, i membri collegati e le attività principali della piattaforma.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm((value) => !value)}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500"
            >
              <Plus size={18} />
              {showForm ? 'Chiudi' : 'Nuova associazione'}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleCreate}
              className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-2xl"
            >
              <h2 className="text-2xl font-bold">
                Crea associazione
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome associazione"
                  required
                  className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-4 text-white outline-none focus:border-indigo-500"
                />

                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrizione"
                  className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-4 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="mt-5 rounded-2xl bg-white px-5 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200"
              >
                Salva associazione
              </button>
            </form>
          )}

          <section className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
              <Building2 className="text-indigo-300" />
              <p className="mt-4 text-sm text-gray-400">
                Associazioni
              </p>
              <h2 className="mt-2 text-4xl font-bold">
                {associations.length}
              </h2>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
              <Users className="text-emerald-300" />
              <p className="mt-4 text-sm text-gray-400">
                Membri collegati
              </p>
              <h2 className="mt-2 text-4xl font-bold">
                {associations.reduce((sum, a) => sum + (a.memberships?.length || 0), 0)}
              </h2>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6">
              <CalendarDays className="text-cyan-300" />
              <p className="mt-4 text-sm text-gray-400">
                Eventi attivi
              </p>
              <h2 className="mt-2 text-4xl font-bold">
                {associations.reduce((sum, a) => sum + (a.events?.length || 0), 0)}
              </h2>
            </div>
          </section>

          <section className="grid gap-5">
            {associations.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-[#1a1f2e] p-12 text-center text-gray-400">
                Nessuna associazione trovata.
              </div>
            ) : (
              associations.map((association) => (
                <div
                  key={association.id}
                  className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {association.name}
                      </h2>

                      <p className="mt-2 text-gray-400">
                        {association.description}
                      </p>
                    </div>

                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                      {association.status}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-[#111827] p-4">
                      <p className="text-sm text-gray-400">Ruolo</p>
                      <p className="mt-1 font-semibold">
                        {association.role}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#111827] p-4">
                      <p className="text-sm text-gray-400">Piano</p>
                      <p className="mt-1 font-semibold">
                        {association.plan}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#111827] p-4">
                      <p className="text-sm text-gray-400">Stato</p>
                      <p className="mt-1 font-semibold">
                        Operativa
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
  href="/dashboard/settings"
  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
>
  <Settings size={16} />
  Impostazioni
</Link>

<Link
  href="/dashboard/members"
  className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
>
  Membri
</Link>

<Link
  href="/dashboard/events"
  className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
>
  Eventi
</Link>
                    <button
                      type="button"
                      onClick={() => deleteAssociation(association.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                      Elimina
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
