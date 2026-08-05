type PasswordSettingsProps = {
  password: string;
  setPassword: (value: string) => void;
  onSubmit: () => Promise<void>;
};

export default function PasswordSettings({
  password,
  setPassword,
  onSubmit,
}: PasswordSettingsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-6 shadow-xl space-y-4">
      <h2 className="text-xl font-semibold">
        Password
      </h2>

      <label className="block text-sm text-gray-300">
        Nuova password
      </label>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-[#1E293B] px-4 py-2 text-white"
      />

      <button
        onClick={onSubmit}
        className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
      >
        Aggiorna password
      </button>
    </div>
  );
}