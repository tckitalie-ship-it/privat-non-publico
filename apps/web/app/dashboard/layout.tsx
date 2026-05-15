import { ReactNode } from 'react';
import DashboardSidebar from '@/components/dashboard-sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <DashboardSidebar />
      {children}
    </div>
  );
}