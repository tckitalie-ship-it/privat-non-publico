import { ReactNode } from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  badge?: string;
  badgeVariant?: "success" | "warning" | "danger" | "info" | "default";
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  badge,
  badgeVariant = "default",
  description,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-bold text-white">
            {value}
          </h2>

          {description && (
            <p className="mt-2 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
          {icon}
        </div>
      </div>

      {badge && (
        <div className="mt-6">
          <Badge variant={badgeVariant}>
            {badge}
          </Badge>
        </div>
      )}
    </Card>
  );
}