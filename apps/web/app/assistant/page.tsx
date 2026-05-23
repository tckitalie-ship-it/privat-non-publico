'use client';

import Link from 'next/link';

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Bot,
  Send,
  Sparkles,
} from 'lucide-react';

import DashboardSidebar from '@/components/dashboard-sidebar';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const STORAGE_KEY =
  'demo-assistant-messages';

const suggestions = [
  'Quanti membri abbiamo?',
  'Riepilogo finanze del mese',
  'Suggerisci un evento',
  'Analizza le spese',
  'Scrivi invito email',
];

function getUserInitials() {
  return 'TU';
}

export default function AssistantPage() {
  const bottomRef =
    useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const saved =
      localStorage.getItem(
        STORAGE_KEY,
      );

    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        setMessages([]);
      }
    } else {
      const welcome: Message[] = [
        {
          id: crypto.randomUUID(),

          role: 'assistant',

          content:
            'Ciao 👋 Sono l’assistente AI della tua associazione. Posso aiutarti con eventi, membri, finanze e organizzazione.',
        },
      ];

      setMessages(welcome);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(welcome),
      );
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  function saveMessages(
    updated: Message[],
  ) {
    setMessages(updated);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated),
    );
  }

  async function handleSend(
    e?: FormEvent,
    forcedText?: string,
  ) {
    e?.preventDefault();

    const text = (
      forcedText || input
    ).trim();

    if (!text || loading) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),

      role: 'user',

      content: text,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    saveMessages(updatedMessages);

    setInput('');
    setLoading(true);

    setTimeout(() => {
      const lower =
        text.toLowerCase();

      let response =
        'Sto analizzando i dati della piattaforma.';

      if (
        lower.includes('membri')
      ) {
        response =
          'La piattaforma mostra una crescita membri positiva.';
      } else if (
        lower.includes('finanze')
      ) {
        response =
          'Le finanze sembrano stabili e in crescita.';
      } else if (
        lower.includes('evento')
      ) {
        response =
          'Potresti organizzare un workshop o meetup networking.';
      } else if (
        lower.includes('spese')
      ) {
        response =
          'Le spese maggiori sembrano concentrate sugli eventi.';
      } else if (
        lower.includes('email')
      ) {
        response =
          'Oggetto: Invito speciale 🎉\n\nCiao! Ti invitiamo al prossimo evento della nostra associazione.';
      }

      const assistantMessage: Message =
        {
          id: crypto.randomUUID(),

          role: 'assistant',

          content: response,
        };

      saveMessages([
        ...updatedMessages,
        assistantMessage,
      ]);

      setLoading(false);
    }, 1200);
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex flex-1 flex-col p-8 md:ml-72">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
          >
            ← Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-300">
            <Sparkles className="h-4 w-4" />

            AI Assistant
          </div>

          <h1 className="mt-4 text-5xl font-bold">
            Assistente AI
          </h1>

          <p className="mt-2 text-gray-400">
            Conversazioni persistenti stile ChatGPT
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-5">
          {suggestions.map(
            (suggestion) => (
              <button
                key={suggestion}
                onClick={() =>
                  handleSend(
                    undefined,
                    suggestion,
                  )
                }
                className="rounded-2xl border border-white/5 bg-[#1a1f2e] p-4 text-left transition hover:border-indigo-500/40 hover:bg-[#20263a]"
              >
                <p className="text-sm font-medium">
                  {suggestion}
                </p>
              </button>
            ),
          )}
        </section>

        <section className="mt-8 flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#1a1f2e] shadow-2xl">
          <div className="border-b border-white/5 p-5">
            <h2 className="text-2xl font-bold">
              Conversazione AI
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Messaggi salvati localmente
            </p>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role ===
                  'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`flex max-w-3xl gap-4 rounded-3xl p-5 ${
                    message.role ===
                    'user'
                      ? 'bg-indigo-600'
                      : 'border border-white/5 bg-[#111827]'
                  }`}
                >
                  <div className="shrink-0">
                    {message.role ===
                    'user' ? (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
                        {getUserInitials()}
                      </div>
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-950/40">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>

                  <p className="whitespace-pre-wrap leading-8 text-gray-100">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-4 rounded-3xl border border-white/5 bg-[#111827] px-6 py-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-950/40">
                    <Bot className="h-5 w-5 text-white" />
                  </div>

                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />

                    <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:120ms]" />

                    <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="border-t border-white/5 p-5"
          >
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) =>
                  setInput(
                    e.target.value,
                  )
                }
                placeholder="Chiedi qualcosa all’AI..."
                className="flex-1 rounded-2xl border border-white/10 bg-[#111827] px-5 py-4 text-white outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 font-semibold transition hover:bg-indigo-500 disabled:opacity-60"
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