"use client";

import { useState, useEffect, useRef } from "react";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const STORAGE_KEY = "assistant_messages";

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  //
  // 🔥 PRIMO useEffect — SOSTITUITO COME RICHIESTO
  //
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

        localStorage.setItem(STORAGE_KEY, JSON.stringify(welcome));
      }
    });
  }, []);

  //
  // 🔥 SECONDO useEffect — NON MODIFICATO
  //
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  //
  // INVIO MESSAGGIO
  //
  function sendMessage() {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulazione risposta AI
    setTimeout(() => {
      const reply: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sto elaborando la tua richiesta…",
      };

      setMessages((prev) => [...prev, reply]);
    }, 600);
  }

  return (
    <div className="p-10 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Assistente AI</h1>

      <div className="space-y-4 bg-[#0F172A] p-6 rounded-2xl border border-white/10 shadow-xl h-[70vh] overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-xl max-w-[80%] ${
              m.role === "assistant"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-white ml-auto"
            }`}
          >
            {m.content}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-[#1E293B] border border-white/10 text-white"
          placeholder="Scrivi un messaggio…"
        />

        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
        >
          Invia
        </button>
      </div>
    </div>
  );
}
