export const theme = {
  colors: {
    background: "#0f172a",
    surface: "#111827",
    border: "border-white/10",

    primary: "#6366F1",
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#06B6D4",

    text: "#FFFFFF",
    textMuted: "#9CA3AF",
  },

  radius: {
    card: "rounded-3xl",
    button: "rounded-2xl",
    badge: "rounded-full",
  },

  shadow: {
    card: "shadow-lg",
    hover: "hover:shadow-2xl",
  },

  transition: {
    default: "transition-all duration-300",
  },
} as const;