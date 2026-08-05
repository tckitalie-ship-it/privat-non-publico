type FileUploadFormProps = {
  uploading: boolean;
  parsedEventsCount: number;
  parseFile: (file: File) => Promise<void>;
  uploadToServer: () => Promise<void>;
};

export default function FileUploadForm({
  uploading,
  parsedEventsCount,
  parseFile,
  uploadToServer,
}: FileUploadFormProps) {
  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            parseFile(file);
          }
        }}
      />

      <button
        type="button"
        disabled={uploading || parsedEventsCount === 0}
        onClick={uploadToServer}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-white"
      >
        {uploading
          ? "Caricamento..."
          : "Importa nel server"}
      </button>
    </div>
  );
}