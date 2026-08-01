import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "default";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variants = {
    success:
      "bg-green-500/15 text-green-400 border border-green-500/20",

    warning:
      "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",

    danger:
      "bg-red-500/15 text-red-400 border border-red-500/20",

    info:
      "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",

    default:
      "bg-gray-500/15 text-gray-300 border border-gray-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}