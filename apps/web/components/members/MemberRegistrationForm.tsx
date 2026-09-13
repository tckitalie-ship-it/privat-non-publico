"use client";

type UserOption = {
  id: string;
  email: string;
};

type Props = {
  users: UserOption[];
  loading?: boolean;
  onSubmit: (data: {
    userId: string;
    firstName: string;
    lastName: string;
    birthDate?: string;
    address?: string;
    phone?: string;
  }) => void;
  onCancel: () => void;
};

export default function MemberRegistrationForm({
  users,
  loading = false,
  onSubmit,
  onCancel,
}: Props) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const userId = String(formData.get("userId") ?? "").trim();
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const birthDate = String(formData.get("birthDate") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!userId || !firstName || !lastName) {
      return;
    }

    onSubmit({
      userId,
      firstName,
      lastName,
      birthDate: birthDate || undefined,
      address: address || undefined,
      phone: phone || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative z-[9999] pointer-events-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Nuova iscrizione
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Registra i dati del socio e assegna automaticamente il numero
          della tessera membro.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Utente
          </span>
          <select
            name="userId"
            disabled={loading}
            required
            defaultValue=""
            className="pointer-events-auto w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
          >
            <option value="">Seleziona utente</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Nome
          </span>
          <input
            name="firstName"
            disabled={loading}
            required
            autoComplete="given-name"
            className="pointer-events-auto w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Cognome
          </span>
          <input
            name="lastName"
            disabled={loading}
            required
            autoComplete="family-name"
            className="pointer-events-auto w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Data di nascita
          </span>
          <input
            name="birthDate"
            type="date"
            disabled={loading}
            className="pointer-events-auto w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
          />
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Telefono
          </span>
          <input
            name="phone"
            type="tel"
            disabled={loading}
            autoComplete="tel"
            className="pointer-events-auto w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Indirizzo
          </span>
          <input
            name="address"
            disabled={loading}
            autoComplete="street-address"
            className="pointer-events-auto w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
          />
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Annulla
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Salvataggio..." : "Registra socio"}
        </button>
      </div>
    </form>
  );
}
