import Link from "next/link";

type VerificationData = {
  valid: boolean;
  membershipId: string;
  memberNumber?: number | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  associationName?: string | null;
};

async function getMembership(id: string): Promise<VerificationData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const baseUrl = apiUrl.replace(/\/+$/, "");

  const endpoint = baseUrl.endsWith("/api")
    ? `${baseUrl}/memberships/verify/${encodeURIComponent(id)}`
    : `${baseUrl}/api/memberships/verify/${encodeURIComponent(id)}`;

  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as VerificationData;
  } catch {
    return null;
  }
}

export default async function VerifyMembershipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getMembership(id);

  if (!data?.valid) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <section className="w-full rounded-3xl border border-red-400/20 bg-white/5 p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-3xl text-red-300">
              ✕
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-red-300">
              Tessera non valida
            </p>

            <h1 className="mt-3 text-3xl font-bold">
              Tessera non trovata
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Il codice della tessera non corrisponde a una membership valida.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const name =
    [data.firstName, data.lastName].filter(Boolean).join(" ") || "Socio";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-3xl border border-emerald-400/20 bg-white/5 shadow-2xl">
          <div className="bg-emerald-500 px-6 py-8 text-center text-slate-950">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl font-black shadow-lg">
              ✓
            </div>

            <p className="mt-5 text-sm font-black uppercase tracking-[0.25em]">
              Tessera valida
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Socio verificato
            </h1>
          </div>

          <div className="p-7 sm:p-9">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                {data.associationName || "Associazione"}
              </p>

              <h2 className="mt-3 text-3xl font-black text-white">
                {name}
              </h2>

              <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                {data.role || "MEMBER"}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tessera
                </p>
                <p className="mt-1 text-xl font-black text-white">
                  {data.memberNumber ?? "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Stato
                </p>
                <p className="mt-1 text-xl font-black text-emerald-300">
                  VALIDA
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                ID tessera
              </p>
              <p className="mt-1 break-all font-mono text-xs text-slate-300">
                {data.membershipId}
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4 text-center">
              <p className="text-sm font-semibold text-emerald-200">
                ✓ Verifica effettuata dal sistema
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Questa pagina conferma che la tessera esiste nel registro
                dell'associazione.
              </p>
            </div>

            <Link
              href="/"
              className="mt-6 block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/10"
            >
              Torna alla home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}