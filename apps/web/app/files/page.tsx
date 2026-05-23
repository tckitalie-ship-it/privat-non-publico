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
  Download,
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

type AssociationFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  createdAt: string;
};

const STORAGE_KEY = 'demo-files';

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
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'IMAGE' | 'DOCUMENT'>('ALL');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setFiles(JSON.parse(saved));
      } catch {
        setFiles([]);
      }
    }
  }, []);

  function saveFiles(updated: AssociationFile[]) {
    setFiles(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch = file.name
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesFilter =
        filter === 'ALL'
          ? true
          : filter === 'IMAGE'
            ? file.type.startsWith('image/')
            : !file.type.startsWith('image/');

      return matchesSearch && matchesFilter;
    });
  }, [files, query, filter]);

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    setUploading(true);

    const newFiles: AssociationFile[] = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      url: URL.createObjectURL(file),
      createdAt: new Date().toISOString(),
    }));

    saveFiles([...newFiles, ...files]);

    setUploading(false);

    toast.success(`${newFiles.length} file caricati`);
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function deleteFile(id: string) {
    const target = files.find((file) => file.id === id);

    if (target) {
      URL.revokeObjectURL(target.url);
    }

    const updated = files.filter((file) => file.id !== id);

    saveFiles(updated);

    toast.success('File eliminato');
  }

  function deleteAllFiles() {
    files.forEach((file) => {
      URL.revokeObjectURL(file.url);
    });

    saveFiles([]);

    toast.success('Tutti i file eliminati');
  }

  const totalStorage = files.reduce((sum, file) => sum + file.size, 0);

  const imagesCount = files.filter((file) =>
    file.type.startsWith('image/'),
  ).length;

  const documentsCount = files.filter(
    (file) => !file.type.startsWith('image/'),
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
                Libreria documenti, immagini e file persistenti della
                piattaforma.
              </p>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-4">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <p className="text-sm text-indigo-300">File totali</p>

              <h2 className="mt-4 text-4xl font-bold">{files.length}</h2>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <p className="text-sm text-cyan-300">Storage usato</p>

              <h2 className="mt-4 text-4xl font-bold">
                {formatFileSize(totalStorage)}
              </h2>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <p className="text-sm text-emerald-300">Immagini</p>

              <h2 className="mt-4 text-4xl font-bold">{imagesCount}</h2>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-amber-500/20 to-[#1a1f2e] p-6 shadow-xl">
              <p className="text-sm text-amber-300">Documenti</p>

              <h2 className="mt-4 text-4xl font-bold">{documentsCount}</h2>
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

              addFiles(e.dataTransfer.files);
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
                  File persistenti salvati localmente
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

            {filteredFiles.length === 0 ? (
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
                    {file.type.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-52 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-52 items-center justify-center bg-gradient-to-br from-indigo-500/10 to-cyan-500/10">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-[#1a1f2e]">
                          {getFileIcon(file.type)}
                        </div>
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5">
                          {getFileIcon(file.type)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-lg font-semibold">
                            {file.name}
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
                        <a
                          href={file.url}
                          download={file.name}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold transition hover:bg-indigo-500"
                        >
                          <Download className="h-4 w-4" />
                          Scarica
                        </a>

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