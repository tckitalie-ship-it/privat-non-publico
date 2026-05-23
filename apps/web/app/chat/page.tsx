'use client';

import Link from 'next/link';

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  MessageCircle,
  Search,
  Send,
  Wifi,
} from 'lucide-react';

import DashboardSidebar from '@/components/dashboard-sidebar';

type ChatMessage = {
  id: string;
  userEmail: string;
  message: string;
  createdAt: string;
};

const STORAGE_KEY =
  'demo-chat-messages';

function getInitials(
  email: string,
) {
  const name =
    email.split('@')[0] ||
    'user';

  return name
    .split(/[._-]/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function ChatPage() {
  const bottomRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [messages, setMessages] =
    useState<ChatMessage[]>(
      [],
    );

  const [message, setMessage] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [typing, setTyping] =
    useState(false);

  useEffect(() => {
    const saved =
      localStorage.getItem(
        STORAGE_KEY,
      );

    if (saved) {
      try {
        setMessages(
          JSON.parse(saved),
        );
      } catch {
        setMessages([]);
      }
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior: 'smooth',
      },
    );
  }, [messages]);

  function saveMessages(
    updated: ChatMessage[],
  ) {
    setMessages(updated);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated),
    );
  }

  function sendMessage(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!message.trim()) return;

    const newMessage: ChatMessage =
      {
        id: crypto.randomUUID(),

        userEmail:
          'test@example.com',

        message:
          message.trim(),

        createdAt:
          new Date().toISOString(),
      };

    saveMessages([
      ...messages,
      newMessage,
    ]);

    setMessage('');

    setTyping(true);

    setTimeout(() => {
      setTyping(false);
    }, 1500);
  }

  const filteredMessages =
    useMemo(() => {
      return messages.filter(
        (item) =>
          item.message
            .toLowerCase()
            .includes(
              search.toLowerCase(),
            ) ||
          item.userEmail
            .toLowerCase()
            .includes(
              search.toLowerCase(),
            ),
      );
    }, [messages, search]);

  const onlineUsers =
    Array.from(
      new Set(
        messages.map(
          (m) => m.userEmail,
        ),
      ),
    );

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex flex-1 flex-col lg:ml-72 lg:flex-row">
        <aside className="w-full border-b border-white/5 bg-[#111827] lg:w-80 lg:border-b-0 lg:border-r">
          <div className="border-b border-white/5 p-6">
            <h1 className="text-3xl font-bold">
              Chat
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Conversazioni realtime demo
            </p>

            <div className="relative mt-5">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value,
                  )
                }
                placeholder="Cerca messaggi..."
                className="w-full rounded-2xl border border-white/10 bg-[#0f172a] py-3 pl-12 pr-4 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-300">
                Online
              </h2>

              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                {
                  onlineUsers.length
                }
              </span>
            </div>

            <div className="space-y-3">
              {onlineUsers.length ===
                0 && (
                <div className="rounded-2xl border border-white/5 bg-[#0f172a] p-4 text-sm text-gray-500">
                  Nessun utente online
                </div>
              )}

              {onlineUsers.map(
                (user) => (
                  <div
                    key={user}
                    className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#0f172a] p-4"
                  >
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-sm font-bold">
                        {getInitials(
                          user,
                        )}
                      </div>

                      <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0f172a] bg-emerald-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {user}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-emerald-300">
                        <Wifi className="h-3 w-3" />
                        Online
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </aside>

        <section className="flex flex-1 flex-col">
          <div className="border-b border-white/5 bg-[#111827] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Canale generale
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Messaggi persistenti salvati localmente
                </p>
              </div>

              <Link
                href="/dashboard"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
              >
                Dashboard
              </Link>
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-6">
            {filteredMessages.length ===
              0 && (
              <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                <MessageCircle className="mb-4 h-14 w-14" />

                <p className="text-lg font-medium">
                  Nessun messaggio
                </p>

                <p className="mt-2 text-sm">
                  Inizia una nuova conversazione 👋
                </p>
              </div>
            )}

            {filteredMessages.map(
              (item) => (
                <div
                  key={item.id}
                  className="max-w-3xl rounded-3xl border border-white/5 bg-[#111827] p-5 shadow-xl"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="relative">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-sm font-bold shadow-lg shadow-indigo-950/40">
                        {getInitials(
                          item.userEmail,
                        )}
                      </div>

                      <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[#111827] bg-emerald-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-semibold text-indigo-300">
                        {
                          item.userEmail
                        }
                      </p>

                      <p className="text-xs text-gray-500">
                        {new Date(
                          item.createdAt,
                        ).toLocaleString(
                          'it-IT',
                        )}
                      </p>
                    </div>
                  </div>

                  <p className="leading-8 text-gray-100">
                    {item.message}
                  </p>
                </div>
              ),
            )}

            {typing && (
              <div className="inline-flex items-center gap-3 rounded-2xl border border-white/5 bg-[#111827] px-5 py-4 text-sm text-gray-400">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />

                  <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:120ms]" />

                  <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:240ms]" />
                </div>

                Utente sta scrivendo...
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={sendMessage}
            className="border-t border-white/5 bg-[#111827] p-5"
          >
            <div className="flex gap-3">
              <input
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value,
                  )
                }
                placeholder="Scrivi un messaggio..."
                className="flex-1 rounded-2xl border border-white/10 bg-[#0f172a] px-5 py-4 text-white outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 font-semibold transition hover:bg-indigo-500"
              >
                <Send className="h-5 w-5" />
                Invia
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}