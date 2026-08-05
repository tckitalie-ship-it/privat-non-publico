"use client";

import { useState } from "react";
import { Bell, Building2, Lock, Save, User } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [associationName, setAssociationName] =
    useState("Associazione Demo");

  const [email, setEmail] =
    useState("admin@example.com");

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  function saveGeneralSettings() {
    toast.success("Impostazioni salvate");
  }

  function changePassword() {
    toast.info(
      "La modifica password sarà collegata all'API nel prossimo passaggio",
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
          Sistema
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Impostazioni
        </h1>

        <p className="mt-2 text-gray-400">
          Gestisci i dati dell&apos;associazione, il profilo e le preferenze.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-[#0f172a] p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <Building2 size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Associazione
              </h2>

              <p className="text-sm text-gray-400">
                Informazioni principali dell&apos;associazione.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="association-name"
                className="text-sm font-medium text-gray-300"
              >
                Nome associazione
              </label>

              <input
                id="association-name"
                value={associationName}
                onChange={(event) =>
                  setAssociationName(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none transition focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={saveGeneralSettings}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              <Save size={18} />
              Salva modifiche
            </button>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#0f172a] p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
              <User size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Profilo amministratore
              </h2>

              <p className="text-sm text-gray-400">
                Dati dell&apos;account attualmente collegato.
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-email"
              className="text-sm font-medium text-gray-300"
            >
              Email
            </label>

            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none transition focus:border-blue-500"
            />
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#0f172a] p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
              <Bell size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Notifiche
              </h2>

              <p className="text-sm text-gray-400">
                Gestisci gli avvisi della piattaforma.
              </p>
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-[#111827] px-4 py-4">
            <div>
              <p className="font-medium text-white">
                Notifiche abilitate
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Ricevi aggiornamenti su membri, eventi e finanze.
              </p>
            </div>

            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(event) =>
                setNotificationsEnabled(
                  event.target.checked,
                )
              }
              className="h-5 w-5"
            />
          </label>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#0f172a] p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
              <Lock size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Sicurezza
              </h2>

              <p className="text-sm text-gray-400">
                Gestisci la password dell&apos;account.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={changePassword}
            className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Cambia password
          </button>
        </article>
      </section>
    </div>
  );
}