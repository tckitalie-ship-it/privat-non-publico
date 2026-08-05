import { cn } from "@/lib/utils";
import React from "react";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
}

export function KpiCard({ title, value, icon, color }: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-sm bg-white flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-1",
        color && `border-${color}-300`
      )}
    >
      <div
        className={cn(
          "p-3 rounded-lg text-white",
          color ? `bg-${color}-500` : "bg-gray-700"
        )}
      >
        {icon}
      </div>

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </div>
    </div>
  );
}
