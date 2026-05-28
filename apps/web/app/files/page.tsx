'use client';

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Link from 'next/link';

import {
  File,
  FileImage,
  FileText,
  FolderOpen,
  Search,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';

import { toast } from 'sonner';

import DashboardSidebar from '@/components/dashboard-sidebar';

import { API_URL, getAccessToken } from '@/lib/api';

type AssociationFile = {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  createdAt: string;
};

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) {
    return <FileImage className="h-6 w-6 text-emerald-300" />;
  }

  if (type.includes('pdf') || type.includes('text')) {
    return <FileText className="h-6 w-6 text-indigo-300" />;
  }

  return <File className="h-6 w-6 text-gray-300" />;
}

export default function FilesPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<AssociationFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'IMAGE' | 'DOCUMENT'>('ALL');

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    try {
      setLoading(true);

      const token = getAccessToken();

      const res = await fetch(`${API_URL}/files`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      if (!res.ok) {
        throw new Error('Errore caricamento files');
      }

      const data = await res.json();

      setFiles(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Errore caricamento files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  async function uploadFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    try {
      setUploading(true);

      const token = getAccessToken();

      for (const file of Array.from(fileList)) {
        const formData = new FormData();

        formData.append('file', file);

        const res = await fetch(`${API_URL}/files/upload`, {
          method: 'POST',
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);

          throw new Error(data?.message || `Errore upload ${file.name}`);
        }
      }

      await loadFiles();

      toast.success(`${fileList.length} file caricati`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Errore upload file');
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    uploadFiles(e.target.files);
  }

  async function deleteFile(id: string) {
    try {
      const token = getAccessToken();

      const res = await fetch(`${API_URL}/files/${id}`, {
        method: 'DELETE',
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);

        throw new Error(data?.message || 'Errore eliminazione file');
      }

      await loadFiles();

      toast.success('File eliminato');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Errore eliminazione file');
    }
  }

  async function deleteAllFiles() {
    for (const file of files) {
      await deleteFile(file.id);
    }
  }

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch = file.originalName
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesFilter =
        filter === 'ALL'
          ? true
          : filter === 'IMAGE'
            ? file.mimetype.startsWith('image/')
            : !file.mimetype.startsWith('image/');

      return matchesSearch && matchesFilter;
    });
  }, [files, query, filter]);

  const totalStorage = files.reduce((sum, file) => sum + file.size, 0);

  const imagesCount = files.filter((file) =>
    file.mimetype.startsWith('image/'),
  ).length;

  const documentsCount = files.filter(
    (file) => !file.mimetype.startsWith('image/'),
  ).length;

  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 p-8 md:ml-72">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
            >
              ← Dashboard
            </Link>
          </div>

          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827] p-8 shadow-2xl">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative">
              <p className="mb-3 inline-flex rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
                File management
              </p>

              <h1 className="text-5xl font-bold">Files</h1>

              <p className="mt-3 max-w-2xl text-gray-400">
                Libreria documenti collegata al backend reale.
              </p>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-4">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <p className="text-sm text-indigo-300">File totali</p>
              <h2 className="mt-4 text-4xl font-bold">
                {loading ? '...' : files.length}
              </h2>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <p className="text-sm text-cyan-300">Storage usato</p>
              <h2 className="mt-4 text-4xl font-bold">
                {loading ? '...' : formatFileSize(totalStorage)}
              </h2>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <p className="text-sm text-emerald-300">Immagini</p>
              <h2 className="mt-4 text-4xl font-bold">
                {loading ? '...' : imagesCount}
              </h2>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-amber-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <p className="text-sm text-amber-300">Documenti</p>
              <h2 className="mt-4 text-4xl font-bold">
                {loading ? '...' : documentsCount}
              </h2>
            </div>
          </section>

          <section
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              uploadFiles(e.dataTransfer.files);
            }}
            className={`rounded-3xl border border-dashed p-8 text-center transition ${
              dragActive
                ? 'border-indigo-400 bg-indigo-600/10'
                : 'border-white/10 bg-[#1a1f2e]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20">
              <UploadCloud className="h-8 w-8 text-indigo-300" />
            </div>

            <h2 className="mt-5 text-2xl font-bold">Carica documenti</h2>

            <p className="mt-2 text-gray-400">
              Drag & drop immagini, PDF o documenti.
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {uploading ? 'Caricamento...' : 'Seleziona file'}
            </button>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#1a1f2e] p-6 shadow-2xl">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Libreria files</h2>

                <p className="mt-1 text-gray-400">
                  File salvati su backend e database.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111827] px-4">
                  <Search className="h-5 w-5 text-gray-500" />

                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cerca file..."
                    className="bg-transparent py-3 outline-none"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value as 'ALL' | 'IMAGE' | 'DOCUMENT')
                  }
                  className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
                >
                  <option value="ALL">Tutti</option>
                  <option value="IMAGE">Immagini</option>
                  <option value="DOCUMENT">Documenti</option>
                </select>

                {files.length > 0 && (
                  <button
                    type="button"
                    onClick={deleteAllFiles}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 px-4 py-3 text-sm text-red-300 transition hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                    Elimina tutto
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="mt-8 h-60 animate-pulse rounded-2xl bg-[#111827]" />
            ) : filteredFiles.length === 0 ? (
              <div className="mt-8 flex min-h-60 flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#111827] text-gray-400">
                <FolderOpen className="mb-4 h-12 w-12" />
                Nessun file trovato.
              </div>
            ) : (
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-xl transition hover:border-indigo-500/40"
                  >
                    <div className="flex h-52 items-center justify-center bg-gradient-to-br from-indigo-500/10 to-cyan-500/10">
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-[#1a1f2e]">
                        {getFileIcon(file.mimetype)}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5">
                          {getFileIcon(file.mimetype)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-lg font-semibold">
                            {file.originalName}
                          </h3>

                          <p className="mt-1 text-sm text-gray-400">
                            {formatFileSize(file.size)}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {new Date(file.createdAt).toLocaleString('it-IT')}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-3">
                        <button
                          type="button"
                          disabled
                          className="inline-flex flex-1 items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-gray-400"
                        >
                          href={`${API_URL}/${file.path}`}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteFile(file.id)}
                          className="inline-flex items-center justify-center rounded-xl border border-red-500/30 px-4 py-3 text-red-300 transition hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}