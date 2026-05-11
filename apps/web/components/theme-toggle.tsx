'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');

    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setDark(true);
    }
  }, []);

  function toggleTheme() {
    const next = !dark;

    setDark(next);

    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
    >
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}