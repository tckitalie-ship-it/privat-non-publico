import { Suspense } from 'react';

import AcceptInviteContent from './accept-invite-content';

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0f1117] text-white">
          Caricamento...
        </main>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
