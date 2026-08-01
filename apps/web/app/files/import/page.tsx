"use client";
import FileUploadForm from "@/components/files/FileUploadForm";
import { useState, useCallback } from "react";
import { API_URL, getAccessToken } from "@/lib/api";

//
// TIPI MINIMI (eliminano tutti gli any)
//
type ImportedEvent = {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
};

export default function ImportEventsPage() {
  const [parsedEvents, setParsedEvents] = useState<ImportedEvent[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  //
  // FIX: parseFile stabilizzato con useCallback
  //
  const parseFile = useCallback(async (file: File) => {
    try {
      const text = await file.text();

      //
      // FIX: nessun any → unknown + cast controllato
      //
      const json = JSON.parse(text) as unknown[];

      const mapped = json.map((e) => {
        const item = e as ImportedEvent;
        return {
          title: item.title,
          description: item.description,
          startsAt: item.startsAt,
          endsAt: item.endsAt,
        };
      });

      setParsedEvents(mapped);
      setMessage(`Importati ${mapped.length} eventi`);
    } catch {
      setMessage("Errore durante il parsing del file");
    }
  }, []);

  //
  // UPLOAD AL BACKEND
  //
  const uploadToServer = useCallback(async () => {
    if (parsedEvents.length === 0) {
      setMessage("Nessun evento da importare");
      return;
    }

    try {
      setUploading(true);

      const token = getAccessToken();

      const res = await fetch(`${API_URL}/events/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(parsedEvents),
      });

      if (!res.ok) {
        setMessage("Errore durante l'importazione");
        return;
      }

      setMessage("Eventi importati con successo!");
      setParsedEvents([]);
    } catch {
      setMessage("Errore di rete");
    } finally {
      setUploading(false);
    }
  }, [parsedEvents]);

  return (
    <div className="p-10 space-y-8">
      <h1 className="text-3xl font-bold">Importa Eventi</h1>

      <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-6 shadow-xl space-y-4">
        <FileUploadForm
  uploading={uploading}
  parsedEventsCount={parsedEvents.length}
  parseFile={parseFile}
  uploadToServer={uploadToServer}
/>
        {message && (
          <p className="text-sm text-gray-300 mt-2">{message}</p>
        )}
      </div>

      {parsedEvents.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Eventi da importare</h2>

          <ul className="space-y-3">
            {parsedEvents.map((ev, i) => (
              <li key={i} className="border-b border-white/10 pb-2">
                <p className="font-semibold">{ev.title}</p>
                <p className="text-gray-400 text-sm">{ev.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(ev.startsAt).toLocaleString("it-IT")} →{" "}
                  {new Date(ev.endsAt).toLocaleString("it-IT")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
