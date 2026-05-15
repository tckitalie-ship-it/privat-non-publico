'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type Theme = 'dark' | 'light';

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>('dark');

  function applyTheme(nextTheme: Theme) {
    const root = document.documentElement;

    if (nextTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('theme', nextTheme);
    setThemeState(nextTheme);
  }

  function setTheme(nextTheme: Theme) {
    applyTheme(nextTheme);
  }

  function toggleTheme() {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;

    if (savedTheme === 'light' || savedTheme === 'dark') {
      applyTheme(savedTheme);
    } else {
      applyTheme('dark');
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}