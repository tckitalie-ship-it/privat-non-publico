'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';

import {
  MessageCircle,
  Send,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';

import { io, Socket } from 'socket.io-client';

import DashboardSidebar from '@/components/dashboard-sidebar';

const SOCKET_URL = 'http://localhost:3000';

type ChatMessage = {
  id: string;
  user?: string;
  text: string;
  createdAt: string;
};

function getAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  const token =
    localStorage.getItem('access_token');

  if (token) {
    return token;
  }

  const cookies =
    document.cookie.split(';');

  for (const cookie of cookies) {
    const [key, value] =
      cookie.trim().split('=');

    if (key === 'access_token') {
      return decodeURIComponent(
        value,
      );
    }
  }

  return null;
}

function getUserEmailFromToken(
  token: string | null,
) {
  if (!token) return 'Utente';

  try {
    const payload = JSON.parse(
      atob(token.split('.')[1]),
    );

    return payload.email || 'Utente';
  } catch {
    return 'Utente';
  }
}

export default function ChatPage() {
  const socketRef =
    useRef<Socket | null>(null);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [connected, setConnected] =
    useState(false);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [message, setMessage] =
    useState('');

  const [room] = useState('global');

  const token = getAccessToken();

  const currentUser =
    getUserEmailFromToken(token);

  useEffect(() => {
    const socket = io(
      SOCKET_URL,
      {
        transports: [
          'websocket',
          'polling',
        ],
        auth: {
          token,
        },
      },
    );

    socketRef.current = socket;

    socket.on(
      'connect',
      () => {
        setConnected(true);

        socket.emit(
          'chat:join',
          {
            room,
          },
        );
      },
    );

    socket.on(
      'disconnect',
      () => {
        setConnected(false);
      },
    );

    socket.on(
      'chat:message',
      (
        incoming: ChatMessage,
      ) => {
        setMessages(
          (current) => [
            ...current,
            incoming,
          ],
        );
      },
    );

    socket.on(
      'chat:history',
      (
        history: ChatMessage[],
      ) => {
        setMessages(
          Array.isArray(
            history,
          )
            ? history
            : [],
        );
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [room, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: 'smooth',
      },
    );
  }, [messages]);

  async function sendMessage() {
    try {
      if (!message.trim()) {
        return;
      }

      const payload: ChatMessage =
        {
          id: crypto.randomUUID(),
          user: currentUser,
          text: message.trim(),
          createdAt:
            new Date().toISOString(),
        };

      socketRef.current?.emit(
        'chat:send',
        {
          room,
          message:
            payload,
        },
      );

      setMessages(
        (current) => [
          ...current,
          payload,
        ],
      );

      setMessage('');
    } catch (error) {
      console.error(error);
    }
  }

  const orderedMessages =
    useMemo(() => {
      return [...messages].sort(
        (a, b) => {
          return (
            new Date(
              a.createdAt,
            ).getTime() -
            new Date(
              b.createdAt,
            ).getTime()
          );
        },
      );
    }, [messages]);

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 px-6 py-8 md:ml-72">
        <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-7xl flex-col">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
            >
              ← Dashboard
            </Link>
          </div>

          <section className="flex flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827] shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-cyan-500/20 p-3 text-cyan-300">
                  <MessageCircle className="h-7 w-7" />
                </div>

                <div>
                  <h1 className="text-3xl font-black">
                    Chat realtime
                  </h1>

                  <p className="mt-1 text-sm text-zinc-400">
                    Room globale live
                    collegata via websocket.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={
                    connected
                      ? 'inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300'
                      : 'inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300'
                  }
                >
                  {connected ? (
                    <Wifi className="h-5 w-5" />
                  ) : (
                    <WifiOff className="h-5 w-5" />
                  )}

                  {connected
                    ? 'Online'
                    : 'Offline'}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <RefreshCw className="h-5 w-5" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#0b1220] p-6">
              {orderedMessages.length ===
              0 ? (
                <div className="flex h-full items-center justify-center text-zinc-500">
                  Nessun messaggio.
                </div>
              ) : (
                <div className="space-y-4">
                  {orderedMessages.map(
                    (
                      item,
                    ) => {
                      const mine =
                        item.user ===
                        currentUser;

                      return (
                        <div
                          key={
                            item.id
                          }
                          className={`flex ${
                            mine
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <div
                            className={
                              mine
                                ? 'max-w-[80%] rounded-3xl rounded-br-md bg-cyan-500 px-5 py-4 text-black shadow-xl'
                                : 'max-w-[80%] rounded-3xl rounded-bl-md border border-white/10 bg-[#111827] px-5 py-4 text-white shadow-xl'
                            }
                          >
                            <div className="mb-2 flex items-center justify-between gap-4">
                              <p
                                className={
                                  mine
                                    ? 'text-xs font-bold text-black/70'
                                    : 'text-xs font-bold text-cyan-300'
                                }
                              >
                                {
                                  item.user
                                }
                              </p>

                              <p
                                className={
                                  mine
                                    ? 'text-[10px] text-black/60'
                                    : 'text-[10px] text-zinc-500'
                                }
                              >
                                {new Date(
                                  item.createdAt,
                                ).toLocaleTimeString(
                                  'it-IT',
                                )}
                              </p>
                            </div>

                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                              {
                                item.text
                              }
                            </p>
                          </div>
                        </div>
                      );
                    },
                  )}

                  <div
                    ref={
                      messagesEndRef
                    }
                  />
                </div>
              )}
            </div>

            <div className="border-t border-white/10 bg-[#111827] p-5">
              <div className="flex gap-3">
                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value,
                    )
                  }
                  placeholder="Scrivi un messaggio realtime..."
                  rows={2}
                  className="flex-1 resize-none rounded-2xl border border-cyan-500/20 bg-[#0b1220] px-5 py-4 text-sm outline-none transition focus:border-cyan-400"
                  onKeyDown={(
                    e,
                  ) => {
                    if (
                      e.key ===
                        'Enter' &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();

                      sendMessage();
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={
                    sendMessage
                  }
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-4 font-bold text-black transition hover:bg-cyan-400"
                >
                  <Send className="h-5 w-5" />
                  Invia
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
                <p>
                  ENTER invia
                  messaggio
                </p>

                <p>
                  Room: global
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}