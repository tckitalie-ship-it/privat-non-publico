'use client';

import { useState } from 'react';
import Link from 'next/link';

type ImportType = 'members' | 'events' | 'finance';

const API_URL = 'http://localhost:3000/api';

function getToken() {
  if (typeof window === 'undefined') return '';

  const localToken = localStorage.getItem('access_token');

  if (localToken) {
    return localToken;
  }

  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');

    if (key === 'access_token') {
      return decodeURIComponent(value);
    }
  }

  return '';
}

function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const headers = lines[0].split(',').map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim());
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });

    return row;
  });
}

export default function ImportPage() {
  const [type, setType] = useState<ImportType>('finance');
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState('');
  const [debug, setDebug] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setStatus('');
    setDebug('');
    setRows([]);
    setFileName(file.name);

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      const text = await file.text();
      const parsed = parseCsv(text);
      setRows(parsed);
      setStatus(`File letto: ${parsed.length} righe.`);
      return;
    }

    if (ext === 'xlsx' || ext === 'xls') {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
      setRows(data);
      setStatus(`File Excel letto: ${data.length} righe.`);
      return;
    }

    setStatus('Formato non supportato. Usa CSV o XLSX.');
  }

  function normalizeType(value: any) {
    const raw = String(value || '').trim().toUpperCase();

    if (raw === 'EXPENSE' || raw === 'USCITA' || raw === 'SPESA') {
      return 'EXPENSE';
    }

    return 'INCOME';
  }

  function mapRow(row: Record<string, any>) {
    if (type === 'members') {
      return {
        email: row.email || row.Email || row.EMAIL,
        role: row.role || row.Ruolo || row.ROLE || 'MEMBER',
      };
    }

    if (type === 'events') {
      return {
        title: row.title || row.titolo || row.Titolo || row.name || 'Evento',
        location: row.location || row.luogo || row.Luogo || '',
        description: row.description || row.descrizione || '',
        startDate:
          row.startDate ||
          row.start ||
          row.inizio ||
          row['data inizio'] ||
          new Date().toISOString(),
        endDate:
          row.endDate ||
          row.end ||
          row.fine ||
          row['data fine'] ||
          new Date().toISOString(),
      };
    }

    const rawAmount =
      row.amount ||
      row.Amount ||
      row.AMOUNT ||
      row.importo ||
      row.Importo ||
      row.IMPORTO ||
      0;

    const amountNumber = Number(String(rawAmount).replace(',', '.'));

    return {
      description:
        row.description ||
        row.Description ||
        row.descrizione ||
        row.Descrizione ||
        'Movimento',
      amountCents: Math.round(amountNumber * 100),
      type: normalizeType(row.type || row.Type || row.tipo || row.Tipo),
      category:
        row.category ||
        row.Category ||
        row.categoria ||
        row.Categoria ||
        'Generale',
      date: row.date || row.Date || row.data || row.Data || new Date().toISOString(),
    };
  }

  async function handleImport() {
    setLoading(true);
    setStatus('');
    setDebug('');

    try {
      const token = getToken();

      if (!token) {
        setStatus('Token mancante. Fai login di nuovo.');
        return;
      }

      if (rows.length === 0) {
        setStatus('Nessuna riga da importare.');
        return;
      }

      let endpoint = '';

      if (type === 'members') endpoint = '/invitations';
      if (type === 'events') endpoint = '/events';
      if (type === 'finance') endpoint = '/finances/transactions';

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (let index = 0; index < rows.length; index += 1) {
        const row = rows[index];
        const body = mapRow(row);

        const res = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        const text = await res.text();

        let responseData: any = null;

        try {
          responseData = text ? JSON.parse(text) : null;
        } catch {
          responseData = text;
        }

        if (res.ok) {
          success += 1;
        } else {
          failed += 1;
          errors.push(
            `Riga ${index + 1}: HTTP ${res.status} - ${JSON.stringify(
              responseData,
            )}`,
          );
        }
      }

      setStatus(`Import completato: ${success} salvati, ${failed} errori.`);

      if (errors.length > 0) {
        setDebug(errors.join('\n'));
      } else {
        setDebug('Tutte le righe sono state salvate correttamente.');
      }
    } catch (err: any) {
      setStatus('Errore durante import.');
      setDebug(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <Link href="/files" className="text-sm text-slate-500">
            ← Files
          </Link>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Import CSV/XLSX
          </h1>

          <p className="text-sm text-slate-500">
            Importa membri, eventi o movimenti finanziari da CSV o Excel.
          </p>
        </div>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <select
              className="rounded-xl border px-4 py-3"
              value={type}
              onChange={(e) => {
                setType(e.target.value as ImportType);
                setStatus('');
                setDebug('');
              }}
            >
              <option value="finance">Importa finanze</option>
              <option value="members">Importa membri</option>
              <option value="events">Importa eventi</option>
            </select>

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="rounded-xl border px-4 py-3"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  handleFile(file);
                }
              }}
            />

            <button
              type="button"
              onClick={handleImport}
              disabled={rows.length === 0 || loading}
              className="rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading ? 'Import in corso...' : 'Importa nel database'}
            </button>
          </div>

          {fileName && (
            <p className="mt-4 text-sm text-slate-500">
              File selezionato: {fileName}
            </p>
          )}

          {status && (
            <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              {status}
            </div>
          )}

          {debug && (
            <pre className="mt-4 whitespace-pre-wrap rounded-xl border bg-black p-4 text-xs text-white">
              {debug}
            </pre>
          )}
        </section>

        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Anteprima dati
            </h2>

            <p className="text-sm text-slate-500">
              Righe lette dal file prima dell’import.
            </p>
          </div>

          {rows.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              Nessun file caricato.
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left">
                    {Object.keys(rows[0]).map((key) => (
                      <th key={key} className="p-3 font-medium">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.slice(0, 20).map((row, index) => (
                    <tr key={index} className="border-b">
                      {Object.keys(rows[0]).map((key) => (
                        <td key={key} className="p-3">
                          {String(row[key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {rows.length > 20 && (
                <p className="p-4 text-sm text-slate-500">
                  Mostrate prime 20 righe su {rows.length}.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}