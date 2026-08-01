import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10 rounded-3xl border border-slate-800 bg-[#161b22] p-8 shadow-xl",
        className
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-5">
          {icon && (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg">
              {icon}
            </div>
          )}

          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Dashboard
            </span>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
              {title}
            </h1>

            {description && (
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}