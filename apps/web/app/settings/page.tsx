'use client';

import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard-sidebar';

export default function SettingsPage() {
  const router = useRouter();

  function handleLogout() {
    localStorage.clear();
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 p-8 lg:ml-72">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold">Settings</h1>
            <p className="mt-2 text-gray-400">
              Gestisci associazione, preferenze e sicurezza
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-xl border border-white/10 px-5 py-3 font-medium transition hover:bg-white/5"
            >
              Dashboard
            </button>

            <button
              onClick={() => router.push('/login')}
              className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
            >
              Login
            </button>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6 shadow-xl">
            <h2 className="text-2xl font-bold">Associazione</h2>
            <p className="mt-2 text-gray-400">
              Configura nome, dati principali e impostazioni operative.
            </p>

            <button
              onClick={() => router.push('/associations')}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
            >
              Gestisci associazioni
            </button>
          </div>

          <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6 shadow-xl">
            <h2 className="text-2xl font-bold">Membri e ruoli</h2>
            <p className="mt-2 text-gray-400">
              Invita membri, assegna ruoli e controlla gli accessi.
            </p>

            <button
              onClick={() => router.push('/members')}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
            >
              Gestisci membri
            </button>
          </div>

          <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6 shadow-xl">
            <h2 className="text-2xl font-bold">Piano attuale</h2>
            <p className="mt-2 text-gray-400">
              Sei nel piano Starter. Puoi passare al piano Pro quando vuoi.
            </p>

            <button
              onClick={() => router.push('/billing')}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
            >
              Upgrade Pro
            </button>
          </div>

          <div className="rounded-3xl border border-red-500/20 bg-[#1a1f2e] p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-red-400">Sicurezza</h2>
            <p className="mt-2 text-gray-400">
              Esci dal tuo account e cancella la sessione locale.
            </p>

            <button
              onClick={handleLogout}
              className="mt-6 rounded-xl border border-red-500/30 px-5 py-3 font-medium text-red-300 transition hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}