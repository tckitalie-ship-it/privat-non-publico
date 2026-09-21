import Link from "next/link";

type VerificationData = {
  valid: boolean;
  associationName?: string | null;
};

async function getMembership(id: string): Promise<VerificationData | null> {
  const apiUrl =
    "https://privat-non-publico-web-tckitalie-ship-its-projects.vercel.app";

  const baseUrl = apiUrl.replace(/\/+$/, "");
  const endpoint = `${baseUrl}/api/memberships/verify/${encodeURIComponent(id)}`;

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
              !
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-red-300">
              Tessera non valida
            </p>

            <h1 className="mt-3 text-3xl font-bold">
              Verifica non riuscita
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              La tessera non risulta valida oppure l'associazione non è attiva.
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-3xl border border-emerald-400/20 bg-white/5 shadow-2xl">
          <div className="bg-emerald-500 px-6 py-10 text-center text-slate-950">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl font-black shadow-lg">
              ✓
            </div>

            <p className="mt-5 text-sm font-black uppercase tracking-[0.25em]">
              Tessera valida
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Verifica effettuata
            </h1>
          </div>

          <div className="p-7 text-center sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Associazione
            </p>

            <h2 className="mt-3 text-2xl font-black text-white">
              {data.associationName || "Associazione"}
            </h2>

            <div className="mt-8 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-5">
              <p className="text-sm font-semibold text-emerald-200">
                Tessera presente nel registro
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                La verifica conferma esclusivamente l'esistenza di una
                membership valida presso questa associazione.
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
