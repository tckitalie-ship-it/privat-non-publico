type FileItem = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
};

type FileCardProps = {
  file: FileItem;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function FileCard({
  file,
  onDownload,
  onDelete,
}: FileCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0F172A] p-6 shadow-xl">
      <div>
        <p className="text-lg font-semibold">
          {file.name}
        </p>

        <p className="text-sm text-gray-400">
          {(file.size / 1024).toFixed(1)} KB — {file.mimeType}
        </p>

        <p className="text-xs text-gray-500">
          Caricato il{" "}
          {new Date(file.createdAt).toLocaleString("it-IT")}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onDownload(file.id)}
          className="rounded-lg bg-emerald-600 px-3 py-1 text-sm hover:bg-emerald-700"
        >
          Download
        </button>

        <button
          onClick={() => onDelete(file.id)}
          className="rounded-lg bg-red-600 px-3 py-1 text-sm hover:bg-red-700"
        >
          Elimina
        </button>
      </div>
    </div>
  );
}