'use client';

import {
  ChangeEvent,
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  Building2,
  Crown,
  LogOut,
  Shield,
  Upload,
  Users,
  Moon,
  Sun,
} from 'lucide-react';

import {
  API_URL,
  clearAccessToken,
  getAccessToken,
} from '@/lib/api';

import { disconnectSocket } from '@/lib/socket';

import DashboardSidebar from '@/components/dashboard-sidebar';
import AuthGuard from '@/components/auth-guard';
import RoleGuard from '@/components/role-guard';

export default function SettingsPage() {
  const router = useRouter();

  const [logoPreview, setLogoPreview] =
    useState<string | null>(null);

  const [logoFile, setLogoFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(
      'demo-dark-mode',
    );

    if (saved) {
      setDarkMode(saved === 'true');
    }
  }, []);

  function toggleTheme() {
    const updated = !darkMode;

    setDarkMode(updated);

    localStorage.setItem(
      'demo-dark-mode',
      String(updated),
    );

    toast.success(
      updated
        ? 'Tema dark attivato'
        : 'Tema light attivato',
    );
  }

  function handleLogout() {
    clearAccessToken();
    disconnectSocket();
    router.replace('/login');
  }

  function handleLogoChange(
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

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

      formData.append(
        'logo',
        logoFile,
      );

      const res = await fetch(
        `${API_URL}/associations/me/logo`,
        {
          method: 'POST',

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            'Errore upload logo',
        );
      }

      toast.success(
        'Logo aggiornato',
      );

      setLogoFile(null);
    } catch (err: any) {
      toast.error(
        err.message ||
          'Errore upload logo',
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <AuthGuard>
      <RoleGuard
        allowedRoles={[
          'OWNER',
          'ADMIN',
        ]}
      >
        <div className="flex min-h-screen bg-[#0f1117] text-white">
          <DashboardSidebar />

          <main className="flex-1 p-5 pt-6 md:ml-72 lg:p-8">
            <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                  Configurazione piattaforma
                </p>

                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                  Settings
                </h1>

                <p className="mt-3 max-w-2xl text-gray-400">
                  Gestisci associazione,
                  branding, sicurezza e
                  preferenze operative.
                </p>
              </div>

              <button
                onClick={() =>
                  router.push(
                    '/dashboard',
                  )
                }
                className="rounded-2xl border border-white/10 px-5 py-3 font-medium transition hover:bg-white/5"
              >
                Dashboard
              </button>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1a1f2e] to-[#111827] p-6 shadow-2xl">
  <div className="flex items-center gap-3">
    <div className="rounded-2xl bg-indigo-500/20 p-3 text-indigo-300">
      <Shield size={22} />
    </div>

    <div>
      <h2 className="text-2xl font-bold">Stato piattaforma</h2>
      <p className="mt-1 text-sm text-gray-400">
        Monitoraggio sistema
      </p>
    </div>
  </div>

  <div className="mt-6 space-y-4">
    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#111827] px-4 py-3">
      <span className="text-sm text-gray-300">Dashboard</span>
      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
        Online
      </span>
    </div>

    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#111827] px-4 py-3">
      <span className="text-sm text-gray-300">Chat realtime</span>
      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
        Attiva
      </span>
    </div>

    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#111827] px-4 py-3">
      <span className="text-sm text-gray-300">Storage locale</span>
      <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
        Persistente
      </span>
    </div>
  </div>
</div>

            <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {/* LOGO */}
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1a1f2e] to-[#111827] p-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-indigo-600/20 p-3 text-indigo-300">
                    <Upload size={22} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">
                      Logo associazione
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Branding e identità
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-5">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a]">
                    {logoPreview ? (
                      <img
                        src={
                          logoPreview
                        }
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">
                        Logo
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={
                        handleLogoChange
                      }
                      className="block text-sm text-gray-300"
                    />

                    <button
                      onClick={
                        handleUploadLogo
                      }
                      disabled={
                        uploading
                      }
                      className="rounded-2xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500 disabled:opacity-60"
                    >
                      {uploading
                        ? 'Upload...'
                        : 'Salva logo'}
                    </button>
                  </div>
                </div>
              </div>

              {/* THEME */}
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1a1f2e] to-[#111827] p-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-indigo-500/20 p-3 text-indigo-300">
                    {darkMode ? (
                      <Moon size={22} />
                    ) : (
                      <Sun size={22} />
                    )}
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">
                      Tema interfaccia
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Preferenze UI demo
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-[#111827] px-5 py-4">
                  <div>
                    <p className="font-medium">
                      Tema attivo
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      {darkMode
                        ? 'Dark mode'
                        : 'Light mode'}
                    </p>
                  </div>

                  <button
                    onClick={
                      toggleTheme
                    }
                    className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-500"
                  >
                    Cambia tema
                  </button>
                </div>
              </div>

              {/* ASSOCIATIONS */}
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1a1f2e] to-[#111827] p-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-500/20 p-3 text-cyan-300">
                    <Building2 size={22} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">
                      Associazione
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Configurazione base
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      '/associations',
                    )
                  }
                  className="mt-6 rounded-2xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
                >
                  Gestisci associazioni
                </button>
              </div>

              {/* MEMBERS */}
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1a1f2e] to-[#111827] p-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-300">
                    <Users size={22} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">
                      Membri e ruoli
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Accessi e permessi
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      '/members',
                    )
                  }
                  className="mt-6 rounded-2xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
                >
                  Gestisci membri
                </button>
              </div>

              {/* PLAN */}
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1a1f2e] to-[#111827] p-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-500/20 p-3 text-amber-300">
                    <Crown size={22} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">
                      Piano attuale
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Starter Plan
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      '/billing',
                    )
                  }
                  className="mt-6 rounded-2xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500"
                >
                  Upgrade Pro
                </button>
              </div>

              {/* LOGOUT */}
              <div className="rounded-[2rem] border border-red-500/20 bg-gradient-to-br from-[#1a1f2e] to-[#111827] p-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-red-500/20 p-3 text-red-300">
                    <LogOut size={22} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-red-400">
                      Sicurezza
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Sessione e accesso
                    </p>
                  </div>
                </div>

                <button
                  onClick={
                    handleLogout
                  }
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-red-500/30 px-5 py-3 font-medium text-red-300 transition hover:bg-red-500/10"
                >
                  <LogOut size={18} />
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