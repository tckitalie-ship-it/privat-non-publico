"use client";

import { useState, useCallback } from "react";
import { API_URL, getAccessToken } from "@/lib/api";

//
// TIPI MINIMI (eliminano tutti gli any)
//
type SearchResult = {
  id: string;
  type: string; // "event" | "member" | "file" | "notification" | ...
  title: string;
  description?: string;
  createdAt?: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  //
  // ESECUZIONE DELLA RICERCA
  //
  const runSearch = useCallback(async () => {
    if (!query.trim()) {
      setMessage("Inserisci un termine di ricerca");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const token = getAccessToken();

      const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setMessage("Errore durante la ricerca");
        return;
      }

      const data = (await res.json()) as unknown[];

      //
      // FIX: nessun any → cast controllato
      //
      const mapped = data.map((r) => r as SearchResult);

      setResults(mapped);
      if (mapped.length === 0) setMessage("Nessun risultato trovato");
    } catch {
      setMessage("Errore di rete");
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="p-10 space-y-8">
      <h1 className="text-3xl font-bold">Ricerca</h1>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Cerca eventi, membri, file..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg bg-[#0F172A] border border-white/10 px-4 py-2 text-white"
        />

        <button
          onClick={runSearch}
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Cercando..." : "Cerca"}
        </button>
      </div>

      {message && <p className="text-sm text-gray-300">{message}</p>}

      {results.length > 0 && (
        <div className="space-y-4 mt-6">
          {results.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-white/10 bg-[#0F172A] p-6 shadow-xl"
            >
              <p className="text-lg font-semibold">{r.title}</p>

              {r.description && (
                <p className="text-gray-400 text-sm mt-1">{r.description}</p>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Tipo: {r.type}
                {r.createdAt &&
                  " — " + new Date(r.createdAt).toLocaleString("it-IT")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
