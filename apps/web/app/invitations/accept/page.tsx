import { Suspense } from 'react';

import AcceptInviteContent from './accept-invite-content';

type PageProps = {
  searchParams: Promise<{
    token?: string | string[];
  }>;
};

export default async function AcceptInvitePage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const rawToken = params.token;

  const token = Array.isArray(rawToken)
    ? rawToken[0] ?? null
    : rawToken ?? null;

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0f1117] text-white">
          Caricamento...
        </main>
      }
    >
      <AcceptInviteContent token={token} />
    </Suspense>
  );
}
