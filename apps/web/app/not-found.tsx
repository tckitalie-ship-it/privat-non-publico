'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  const [associationName, setAssociationName] =
    useState('Association SaaS');

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [darkMode, setDarkMode] = useState(true);

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);

      await new Promise((resolve) =>
        setTimeout(resolve, 1200),
      );

      alert('Impostazioni salvate');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0f1117] p-8 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold">
              Settings
            </h1>

            <p className="mt-2 text-gray-400">
              Gestisci configurazione piattaforma
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-2xl border border-white/10 px-5 py-3 transition hover:bg-white/5"
          >
            Dashboard
          </button>
        </div>

        <section className="animate-fade-up rounded-3xl border border-white/5 bg-[#1a1f2e] p-8 shadow-xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">
              Associazione
            </h2>

            <p className="mt-2 text-gray-400">
              Informazioni principali piattaforma
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Nome associazione
              </label>

              <input
                type="text"
                value={associationName}
                onChange={(e) =>
                  setAssociationName(e.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-5 py-4 text-white outline-none transition focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#111827] p-5">
              <div>
                <h3 className="font-semibold">
                  Notifiche email
                </h3>

                <p className="text-sm text-gray-400">
                  Ricevi aggiornamenti attività
                </p>
              </div>

              <button
                onClick={() =>
                  setEmailNotifications(
                    !emailNotifications,
                  )
                }
                className={`relative h-8 w-16 rounded-full transition ${
                  emailNotifications
                    ? 'bg-indigo-600'
                    : 'bg-gray-700'
                }`}
              >
                <div
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                    emailNotifications
                      ? 'left-9'
                      : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#111827] p-5">
              <div>
                <h3 className="font-semibold">
                  Dark mode
                </h3>

                <p className="text-sm text-gray-400">
                  Tema scuro premium
                </p>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative h-8 w-16 rounded-full transition ${
                  darkMode
                    ? 'bg-indigo-600'
                    : 'bg-gray-700'
                }`}
              >
                <div
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                    darkMode
                      ? 'left-9'
                      : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        <section className="animate-fade-up rounded-3xl border border-white/5 bg-[#1a1f2e] p-8 shadow-xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">
              Sicurezza
            </h2>

            <p className="mt-2 text-gray-400">
              Gestione account e accessi
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <button className="rounded-2xl border border-white/10 bg-[#111827] p-5 text-left transition hover:bg-white/5">
              <h3 className="text-xl font-bold">
                Cambia password
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Aggiorna credenziali accesso
              </p>
            </button>

            <button className="rounded-2xl border border-white/10 bg-[#111827] p-5 text-left transition hover:bg-white/5">
              <h3 className="text-xl font-bold">
                Sessioni attive
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Controlla dispositivi collegati
              </p>
            </button>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-semibold transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving
              ? 'Salvataggio...'
              : 'Salva impostazioni'}
          </button>
        </div>
      </div>
    </main>
  );
}