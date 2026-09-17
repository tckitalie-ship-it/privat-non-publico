"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const STORAGE_KEY = "assistant_messages";
const API_URL = "/api";

function getActiveAssociationId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const possibleKeys = [
    "associationId",
    "activeAssociationId",
    "active_association_id",
  ];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key)?.trim();

    if (value) {
      return value;
    }
  }

  return null;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      const saved = localStorage.getItem(STORAGE_KEY);

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
            role: "assistant",
            content:
              "Ciao 👋 Sono l’assistente AI della tua associazione. Posso aiutarti con eventi, membri, finanze e organizzazione.",
          },
        ];

        setMessages(welcome);

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(welcome),
        );
      }
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

    if (messages.length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages),
      );
    }
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();

    if (!text || loading) {
      return;
    }

    const associationId = getActiveAssociationId();

    const history = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/assistant/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(associationId
              ? {
                  "x-association-id": associationId,
                }
              : {}),
          },
          body: JSON.stringify({
            message: text,
            history,
            ...(associationId
              ? {
                  associationId,
                }
              : {}),
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const backendMessage =
          typeof data?.message === "string"
            ? data.message
            : Array.isArray(data?.message)
              ? data.message.join(", ")
              : null;

        throw new Error(
          backendMessage ||
            `Errore dell'assistente (${response.status})`,
        );
      }

      const answer =
        typeof data?.answer === "string"
          ? data.answer
          : typeof data?.response === "string"
            ? data.response
            : typeof data?.reply === "string"
              ? data.reply
              : typeof data?.message === "string"
                ? data.message
                : typeof data === "string"
                  ? data
                  : "";

      if (!answer.trim()) {
        console.error(
          "[Assistant] Risposta backend non valida:",
          data,
        );

        throw new Error(
          "Il backend dell'assistente ha risposto senza contenuto.",
        );
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer.trim(),
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "Assistant error:",
        error,
      );

      const errorText =
        error instanceof Error
          ? error.message
          : "Errore sconosciuto.";

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `⚠️ ${errorText}`,
      };

      setMessages((previous) => [
        ...previous,
        errorMessage,
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    const welcome: Message[] = [
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Ciao 👋 Sono l’assistente AI della tua associazione. Posso aiutarti con eventi, membri, finanze e organizzazione.",
      },
    ];

    setMessages(welcome);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(welcome),
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Assistente AI
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Il tuo assistente per la gestione
            dell’associazione
          </p>
        </div>

        <button
          onClick={clearChat}
          className="rounded-lg bg-gray-700 px-3 py-2 text-sm text-gray-200 transition hover:bg-gray-600"
        >
          Nuova chat
        </button>
      </div>

      <div className="h-[70vh] space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-[#0F172A] p-6 shadow-xl">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] whitespace-pre-wrap rounded-xl p-3 ${
              message.role === "assistant"
                ? "bg-blue-600 text-white"
                : "ml-auto bg-gray-700 text-white"
            }`}
          >
            {message.content}
          </div>
        ))}

        {loading && (
          <div className="max-w-[80%] rounded-xl bg-blue-600 p-3 text-white">
            Sto elaborando la tua richiesta…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="flex-1 rounded-lg border border-white/10 bg-[#1E293B] px-4 py-3 text-white outline-none focus:border-blue-500 disabled:opacity-50"
          placeholder="Scrivi un messaggio…"
        />

        <button
          onClick={sendMessage}
          disabled={
            loading || !input.trim()
          }
          className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "..." : "Invia"}
        </button>
      </div>
    </div>
  );
}