import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl",
        "border border-white/10",
        "bg-[#111827]",
        "shadow-lg",
        "transition-all duration-300",
        "hover:border-indigo-500/30",
        "hover:shadow-2xl",
        className
      )}
    >
      {children}
    </div>
  );
}