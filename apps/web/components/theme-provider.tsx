"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext =
  createContext<ThemeContextType | undefined>(
    undefined,
  );

const STORAGE_KEY = "theme";

function applyThemeToDocument(theme: Theme) {
  document.documentElement.classList.remove(
    "light",
    "dark",
  );

  document.documentElement.classList.add(theme);

  localStorage.setItem(
    STORAGE_KEY,
    theme,
  );
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
    const [theme, setTheme] = useState<Theme>(() => {
  if (typeof window === "undefined") {
    return "dark";
  }

  const saved = localStorage.getItem(STORAGE_KEY);

  return saved === "light" ? "light" : "dark";
});

  function applyTheme(theme: Theme) {
    applyThemeToDocument(theme);
    setTheme(theme);
  }

  function toggleTheme() {
    applyTheme(
      theme === "dark"
        ? "light"
        : "dark",
    );
  }

   useEffect(() => {
  applyThemeToDocument(theme);
}, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: applyTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(
    ThemeContext,
  );

  if (!context) {
    throw new Error(
      "useTheme must be used within ThemeProvider",
    );
  }

  return context;
}