type ProfileSettingsProps = {
  name: string;
  setName: (value: string) => void;
  onSubmit: () => Promise<void>;
};

export default function ProfileSettings({
  name,
  setName,
  onSubmit,
}: ProfileSettingsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-6 shadow-xl space-y-4">
      <h2 className="text-xl font-semibold">
        Profilo
      </h2>

      <label className="block text-sm text-gray-300">
        Nome
      </label>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-[#1E293B] px-4 py-2 text-white"
      />

      <button
        onClick={onSubmit}
        className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
      >
        Aggiorna profilo
      </button>
    </div>
  );
}