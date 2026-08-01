import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500",
    secondary:
      "bg-[#1f2937] hover:bg-[#374151] text-white border border-white/10",
    danger:
      "bg-red-600 hover:bg-red-500 text-white border border-red-500",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-2xl",
        "px-5 py-3",
        "font-medium",
        "transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}