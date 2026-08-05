"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  Download,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType2,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui";
import {
  API_URL,
  getAccessToken,
} from "@/lib/api";

type FileItem = {
  id: string;
  name: string;
  originalName?: string | null;
  filename?: string | null;
  url: string;
  mimetype?: string | null;
  size?: number | null;
  createdAt?: string;
  uploadedById?: string | null;
  uploadedBy?: {
    id: string;
    email: string;
  } | null;
};

type ApiErrorResponse = {
  message?: string | string[];
};

function getErrorMessage(
  data: ApiErrorResponse | null,
  fallback: string,
) {
  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  return fallback;
}

async function requestFiles(): Promise<FileItem[]> {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Sessione non disponibile. Effettua nuovamente il login.",
    );
  }

  const response = await fetch(
    `${API_URL}/files`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const data =
    (await response
      .json()
      .catch(() => null)) as
      | FileItem[]
      | ApiErrorResponse
      | null;

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data as ApiErrorResponse | null,
        `Errore caricamento file (${response.status})`,
      ),
    );
  }

  return Array.isArray(data) ? data : [];
}

const ACCEPTED_FILE_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".txt",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
].join(",");

function formatFileSize(
  bytes?: number | null,
) {
  if (
    bytes === null ||
    bytes === undefined
  ) {
    return "Dimensione non disponibile";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(
      1,
    )} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return "Data non disponibile";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data non disponibile";
  }

  return date.toLocaleString("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getFileIcon(
  mimetype?: string | null,
) {
  if (mimetype?.startsWith("image/")) {
    return FileImage;
  }

  if (
    mimetype?.includes("spreadsheet") ||
    mimetype?.includes("excel") ||
    mimetype === "text/csv"
  ) {
    return FileSpreadsheet;
  }

  if (
    mimetype?.includes("word") ||
    mimetype?.includes("document")
  ) {
    return FileType2;
  }

  return FileText;
}

function getFileTypeLabel(
  mimetype?: string | null,
) {
  if (!mimetype) {
    return "Tipo sconosciuto";
  }

  if (mimetype === "application/pdf") {
    return "PDF";
  }

  if (mimetype.startsWith("image/")) {
    return "Immagine";
  }

  if (
    mimetype.includes("spreadsheet") ||
    mimetype.includes("excel")
  ) {
    return "Foglio di calcolo";
  }

  if (mimetype === "text/csv") {
    return "CSV";
  }

  if (
    mimetype.includes("word") ||
    mimetype.includes("document")
  ) {
    return "Documento Word";
  }

  if (mimetype === "text/plain") {
    return "Testo";
  }

  return mimetype;
}

function getDownloadFilename(
  file: FileItem,
) {
  return (
    file.originalName ||
    file.name ||
    "documento"
  );
}

export default function DashboardFilesPage() {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<
    FileItem[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  const [
    downloadingId,
    setDownloadingId,
  ] = useState<string | null>(null);

  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(null);

  const [
    confirmDeleteFile,
    setConfirmDeleteFile,
  ] = useState<FileItem | null>(null);

  const loadFiles =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const loadedFiles =
          await requestFiles();

        setFiles(loadedFiles);
      } catch (loadError) {
        console.error(
          "Errore caricamento file:",
          loadError,
        );

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossibile caricare i file";

        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    let cancelled = false;

    async function initializeFiles() {
      try {
        const loadedFiles =
          await requestFiles();

        if (cancelled) {
          return;
        }

        setFiles(loadedFiles);
        setError("");
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Errore caricamento file:",
          loadError,
        );

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Impossibile caricare i file";

        setError(message);
        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initializeFiles();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredFiles = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return files;
    }

    return files.filter((file) => {
      const name = (
        file.originalName ||
        file.name ||
        ""
      ).toLowerCase();

      const mimetype = (
        file.mimetype || ""
      ).toLowerCase();

      const uploader = (
        file.uploadedBy?.email || ""
      ).toLowerCase();

      return (
        name.includes(query) ||
        mimetype.includes(query) ||
        uploader.includes(query)
      );
    });
  }, [files, search]);

  const totalSize = useMemo(
    () =>
      files.reduce(
        (total, file) =>
          total + (file.size ?? 0),
        0,
      ),
    [files],
  );

  async function uploadFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile =
      event.target.files?.[0];

    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (
      selectedFile.size >
      20 * 1024 * 1024
    ) {
      toast.error(
        "Il file non può superare 20 MB",
      );
      return;
    }

    const token = getAccessToken();

    if (!token) {
      toast.error(
        "Sessione non disponibile",
      );
      return;
    }

    const formData = new FormData();
    formData.append(
      "file",
      selectedFile,
    );

    try {
      setUploading(true);

      const response = await fetch(
        `${API_URL}/files/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(
          data?.message,
        )
          ? data.message.join(", ")
          : data?.message;

        throw new Error(
          message ||
            `Errore caricamento file (${response.status})`,
        );
      }

      toast.success(
        "File caricato con successo",
      );

      await loadFiles();
    } catch (uploadError) {
      console.error(
        "Errore upload file:",
        uploadError,
      );

      toast.error(
        uploadError instanceof Error
          ? uploadError.message
          : "Impossibile caricare il file",
      );
    } finally {
      setUploading(false);
    }
  }

  async function downloadFile(
    file: FileItem,
  ) {
    const token = getAccessToken();

    if (!token) {
      toast.error(
        "Sessione non disponibile",
      );
      return;
    }

    try {
      setDownloadingId(file.id);

      const response = await fetch(
        `${API_URL}/files/${file.id}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null);

        const message = Array.isArray(
          data?.message,
        )
          ? data.message.join(", ")
          : data?.message;

        throw new Error(
          message ||
            `Errore download file (${response.status})`,
        );
      }

      const blob =
        await response.blob();

      const objectUrl =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = objectUrl;
      anchor.download =
        getDownloadFilename(file);

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(objectUrl);

      toast.success(
        "Download avviato",
      );
    } catch (downloadError) {
      console.error(
        "Errore download file:",
        downloadError,
      );

      toast.error(
        downloadError instanceof Error
          ? downloadError.message
          : "Impossibile scaricare il file",
      );
    } finally {
      setDownloadingId(null);
    }
  }

  async function deleteFile() {
    if (!confirmDeleteFile) {
      return;
    }

    const token = getAccessToken();

    if (!token) {
      toast.error(
        "Sessione non disponibile",
      );
      return;
    }

    try {
      setDeletingId(
        confirmDeleteFile.id,
      );

      const response = await fetch(
        `${API_URL}/files/${confirmDeleteFile.id}`,
        {
          method: "DELETE",
          headers: {
            Accept:
              "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(
          data?.message,
        )
          ? data.message.join(", ")
          : data?.message;

        throw new Error(
          message ||
            `Errore eliminazione file (${response.status})`,
        );
      }

      setFiles((currentFiles) =>
        currentFiles.filter(
          (file) =>
            file.id !==
            confirmDeleteFile.id,
        ),
      );

      toast.success(
        "File eliminato",
      );

      setConfirmDeleteFile(null);
    } catch (deleteError) {
      console.error(
        "Errore eliminazione file:",
        deleteError,
      );

      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Impossibile eliminare il file",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestione File"
        description="Carica, organizza, scarica e gestisci i documenti dell'associazione."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5">
          <p className="text-sm text-gray-400">
            File totali
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {files.length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5">
          <p className="text-sm text-gray-400">
            Spazio occupato
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-300">
            {formatFileSize(totalSize)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5">
          <p className="text-sm text-gray-400">
            Limite per file
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-300">
            20 MB
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Cerca per nome, tipo o autore..."
            className="w-full rounded-xl border border-white/10 bg-[#0f172a] py-3 pl-11 pr-4 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            onChange={(event) =>
              void uploadFile(event)
            }
            className="hidden"
          />

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Upload size={18} />
            )}

            {uploading
              ? "Caricamento..."
              : "Carica file"}
          </button>

          <button
            type="button"
            onClick={() =>
              void loadFiles()
            }
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0f172a] px-5 py-3 font-medium text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Aggiorna
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            Documenti
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            {filteredFiles.length}{" "}
            {filteredFiles.length === 1
              ? "file visualizzato"
              : "file visualizzati"}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-3 text-gray-400">
            <Loader2
              className="animate-spin"
              size={22}
            />
            Caricamento file...
          </div>
        ) : error ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-4 text-center">
            <AlertCircle
              className="text-red-400"
              size={38}
            />

            <div>
              <p className="font-semibold text-white">
                Impossibile caricare i file
              </p>

              <p className="mt-2 text-sm text-red-300">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadFiles()
              }
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Riprova
            </button>
          </div>
        ) : filteredFiles.length ===
          0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-center">
            <FileText
              className="mb-4 text-gray-500"
              size={42}
            />

            <p className="font-semibold text-white">
              {files.length === 0
                ? "Nessun file presente"
                : "Nessun risultato"}
            </p>

            <p className="mt-2 text-sm text-gray-400">
              {files.length === 0
                ? "Carica il primo documento dell’associazione."
                : "Prova a modificare il testo della ricerca."}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredFiles.map(
              (file) => {
                const Icon =
                  getFileIcon(
                    file.mimetype,
                  );

                const isDownloading =
                  downloadingId ===
                  file.id;

                const isDeleting =
                  deletingId ===
                  file.id;

                return (
                  <li
                    key={file.id}
                    className="flex min-w-0 flex-col gap-4 rounded-2xl border border-white/10 bg-[#111827] p-4 transition hover:border-blue-500/30 md:flex-row md:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                        <Icon size={23} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                          {file.originalName ||
                            file.name}
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                          {formatFileSize(
                            file.size,
                          )}
                          {" · "}
                          {getFileTypeLabel(
                            file.mimetype,
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Caricato il{" "}
                          {formatDate(
                            file.createdAt,
                          )}
                          {file.uploadedBy
                            ?.email
                            ? ` da ${file.uploadedBy.email}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          void downloadFile(
                            file,
                          )
                        }
                        disabled={
                          isDownloading ||
                          isDeleting
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Download
                            size={16}
                          />
                        )}

                        Scarica
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDeleteFile(
                            file,
                          )
                        }
                        disabled={
                          isDownloading ||
                          isDeleting
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2
                            size={16}
                          />
                        )}

                        Elimina
                      </button>
                    </div>
                  </li>
                );
              },
            )}
          </ul>
        )}
      </section>

      {confirmDeleteFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Elimina file
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Vuoi eliminare
                  definitivamente:
                </p>

                <p className="mt-2 break-words font-semibold text-white">
                  {confirmDeleteFile.originalName ||
                    confirmDeleteFile.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setConfirmDeleteFile(
                    null,
                  )
                }
                disabled={
                  deletingId !== null
                }
                className="rounded-xl border border-white/10 p-2 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                aria-label="Chiudi"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-4 text-sm text-red-300">
              Questa operazione non può
              essere annullata.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setConfirmDeleteFile(
                    null,
                  )
                }
                disabled={
                  deletingId !== null
                }
                className="rounded-xl border border-white/10 px-5 py-3 font-medium text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
              >
                Annulla
              </button>

              <button
                type="button"
                onClick={() =>
                  void deleteFile()
                }
                disabled={
                  deletingId !== null
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId && (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                )}

                Elimina definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}