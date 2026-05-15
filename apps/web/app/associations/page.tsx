'use client';

import DashboardSidebar from '@/components/dashboard-sidebar';

export default function AssociationsPage() {
  return (
    <div className="flex min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />

      <main className="flex-1 p-8 lg:ml-72">
        <h1 className="text-5xl font-bold">Associazioni</h1>
        <p className="mt-2 text-gray-400">Gestisci le tue associazioni.</p>
      </main>
    </div>
  );
}