'use client';

import { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { API_URL, clearAccessToken, getAccessToken } from '@/lib/api';
import { disconnectSocket } from '@/lib/socket';
import DashboardSidebar from '@/components/dashboard-sidebar';
import AuthGuard from '@/components/auth-guard';
import RoleGuard from '@/components/role-guard';

export default function SettingsPage() {
  const router = useRouter();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  function handleLogout() {
    clearAccessToken();
    disconnectSocket();
    router.replace('/login');
  }

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleUploadLogo() {
    const token = getAccessToken();

    if (!token) {
      router.replace('/login');
      return;
    }

    if (!logoFile) {
      toast.error('Seleziona prima un logo');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('logo', logoFile);

      const res = await fetch(`${API_URL}/associations/me/logo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore upload logo');
      }

      toast.success('Logo aggiornato');
      setLogoFile(null);
    } catch (err: any) {
      toast.error(err.message || 'Errore upload logo');
    } finally {
      setUploading(false);
    }
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
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

              <button
                onClick={() => router.push('/dashboard')}
                className="rounded-xl border border-white/10 px-5 py-3 font-medium transition hover:bg-white/5"
              >
                Dashboard
              </button>
            </div>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/5 bg-[#1a1f2e] p-6 shadow-xl">
                <h2 className="text-2xl font-bold">Logo associazione</h2>
                <p className="mt-2 text-gray-400">
                  Carica un logo PNG, JPG o WebP per la tua associazione.
                </p>

                <div className="mt-6 flex items-center gap-5">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a]">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">Logo</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoChange}
                      className="block text-sm text-gray-300 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-500"
                    />

                    <button
                      onClick={handleUploadLogo}
                      disabled={uploading}
                      className="rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500 disabled:opacity-60"
                    >
                      {uploading ? 'Upload...' : 'Salva logo'}
                    </button>
                  </div>
                </div>
              </div>

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
      </RoleGuard>
    </AuthGuard>
  );
}