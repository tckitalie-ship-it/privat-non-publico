'use client';

import Link from 'next/link';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Bell,
  File,
  MessageCircle,
  Search,
  CalendarDays,
  Building2,
  Users,
} from 'lucide-react';

import DashboardSidebar from '@/components/dashboard-sidebar';

type SearchItem = {
  id: string;

  type:
    | 'event'
    | 'chat'
    | 'file'
    | 'notification'
    | 'association'
    | 'member';

  title: string;

  description: string;

  createdAt?: string;
};

export default function SearchPage() {
  const [query, setQuery] =
    useState('');

  const [items, setItems] =
    useState<SearchItem[]>([]);

  useEffect(() => {
    const events =
      JSON.parse(
        localStorage.getItem(
          'demo-events',
        ) || '[]',
      ).map((event: any) => ({
        id: event.id,

        type: 'event',

        title:
          event.title ||
          'Evento',

        description:
          event.description ||
          'Nessuna descrizione',

        createdAt:
          event.startsAt,
      }));

    const files =
      JSON.parse(
        localStorage.getItem(
          'demo-files',
        ) || '[]',
      ).map((file: any) => ({
        id: file.id,

        type: 'file',

        title:
          file.name ||
          'File',

        description:
          file.type ||
          'Documento',

        createdAt:
          file.createdAt,
      }));

    const chats =
      JSON.parse(
        localStorage.getItem(
          'demo-chat-messages',
        ) || '[]',
      ).map((chat: any) => ({
        id: chat.id,

        type: 'chat',

        title:
          chat.userEmail ||
          'Messaggio',

        description:
          chat.message ||
          '',

        createdAt:
          chat.createdAt,
      }));

    const notifications =
      JSON.parse(
        localStorage.getItem(
          'demo-notifications',
        ) || '[]',
      ).map(
        (
          notification: any,
        ) => ({
          id: notification.id,

          type: 'notification',

          title:
            notification.title,

          description:
            notification.message,

          createdAt:
            notification.createdAt,
        }),
      );

    const associations =
      JSON.parse(
        localStorage.getItem(
          'demo-associations',
        ) || '[]',
      ).map(
        (
          association: any,
        ) => ({
          id: association.id,

          type: 'association',

          title:
            association.name ||
            'Associazione',

          description:
            association.description ||
            'Workspace associazione',

          createdAt:
            association.createdAt,
        }),
      );

    const members =
      JSON.parse(
        localStorage.getItem(
          'demo-member-invitations',
        ) || '[]',
      ).map((member: any) => ({
        id: member.id,

        type: 'member',

        title:
          member.email ||
          'Membro',

        description:
          `Ruolo: ${member.role}`,

        createdAt:
          member.createdAt,
      }));

    setItems([
      ...events,
      ...files,
      ...chats,
      ...notifications,
      ...associations,
      ...members,
    ]);
  }, []);

  const filtered =
    useMemo(() => {
      return items.filter(
        (item) =>
          item.title
            .toLowerCase()
            .includes(
              query.toLowerCase(),
            ) ||
          item.description
            .toLowerCase()
            .includes(
              query.toLowerCase(),
            ),
      );
    }, [items, query]);

  function getIcon(
    type: SearchItem['type'],
  ) {
    switch (type) {
      case 'event':
        return (
          <CalendarDays className="h-5 w-5 text-emerald-300" />
        );

      case 'chat':
        return (
          <MessageCircle className="h-5 w-5 text-indigo-300" />
        );

      case 'file':
        return (
          <File className="h-5 w-5 text-amber-300" />
        );

      case 'notification':
        return (
          <Bell className="h-5 w-5 text-pink-300" />
        );

      case 'association':
        return (
          <Building2 className="h-5 w-5 text-cyan-300" />
        );

      case 'member':
        return (
          <Users className="h-5 w-5 text-purple-300" />
        );
    }
  }

  function getTypeColor(
    type: SearchItem['type'],
  ) {
    switch (type) {
      case 'event':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';

      case 'chat':
        return 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300';

      case 'file':
        return 'border-amber-500/20 bg-amber-500/10 text-amber-300';

      case 'notification':
        return 'border-pink-500/20 bg-pink-500/10 text-pink-300';

      case 'association':
        return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300';

      case 'member':
        return 'border-purple-500/20 bg-purple-500/10 text-purple-300';
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 px-6 py-8 md:ml-72">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
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
              <p className="text-sm font-medium text-indigo-400">
                Ricerca globale
              </p>

              <h1 className="mt-2 text-5xl font-bold">
                Search
              </h1>

              <p className="mt-3 max-w-2xl text-zinc-400">
                Cerca tra eventi,
                membri, chat,
                notifiche,
                associazioni e file
                salvati localmente.
              </p>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

              <input
                value={query}
                onChange={(e) =>
                  setQuery(
                    e.target.value,
                  )
                }
                placeholder="Cerca membri, eventi, associazioni, file..."
                className="w-full rounded-2xl border border-white/10 bg-[#0f172a] py-4 pl-12 pr-4 text-white outline-none transition focus:border-indigo-500"
              />
            </div>

            <div className="mt-8 grid gap-4">
              {filtered.length ===
              0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0f172a] p-12 text-center text-zinc-400">
                  Nessun risultato trovato
                </div>
              ) : (
                filtered.map(
                  (item) => (
                    <div
                      key={
                        item.id
                      }
                      className="rounded-2xl border border-white/10 bg-[#0f172a] p-5 transition hover:border-indigo-500/40"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                          {getIcon(
                            item.type,
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-semibold">
                              {
                                item.title
                              }
                            </h2>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs uppercase ${getTypeColor(
                                item.type,
                              )}`}
                            >
                              {
                                item.type
                              }
                            </span>
                          </div>

                          <p className="mt-2 text-sm leading-6 text-zinc-400">
                            {
                              item.description
                            }
                          </p>

                          {item.createdAt && (
                            <p className="mt-3 text-xs text-zinc-500">
                              {new Date(
                                item.createdAt,
                              ).toLocaleString(
                                'it-IT',
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ),
                )
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}