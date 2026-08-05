import { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: string;
}

const colorClasses: Record<string, string> = {
  blue: "from-blue-500/20 to-blue-600/10 text-blue-400",
  indigo: "from-indigo-500/20 to-indigo-600/10 text-indigo-400",
  purple: "from-purple-500/20 to-purple-600/10 text-purple-400",
  gray: "from-slate-500/20 to-slate-600/10 text-slate-300",
  yellow: "from-yellow-500/20 to-yellow-600/10 text-yellow-400",
  orange: "from-orange-500/20 to-orange-600/10 text-orange-400",
  green: "from-green-500/20 to-green-600/10 text-green-400",
  red: "from-red-500/20 to-red-600/10 text-red-400",
  teal: "from-teal-500/20 to-teal-600/10 text-teal-400",
  cyan: "from-cyan-500/20 to-cyan-600/10 text-cyan-400",
};

export function KpiCard({
  title,
  value,
  icon,
  color = "gray",
}: KpiCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-3xl p-6",
        "transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-2xl"
      )}
    >
      {/* Glow */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {title}
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white">
              {value}
            </h2>
          </div>

          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl",
              "bg-gradient-to-br shadow-lg transition-transform duration-300",
              "group-hover:scale-110",
              colorClasses[color] ?? colorClasses.gray
            )}
          >
            {icon}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

            <span className="text-xs text-slate-400">
              Aggiornato in tempo reale
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
            <ArrowUpRight size={14} />
            Live
          </div>
        </div>
      </div>
    </Card>
  );
}