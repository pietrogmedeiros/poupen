'use client';

import { useThemeHook } from '@/lib/hooks/useThemeHook';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { mounted, isDark, toggleTheme } = useThemeHook();

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="group relative p-2 rounded-lg transition-all duration-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500 transition-transform group-hover:rotate-180 duration-500" />
      ) : (
        <Moon className="w-5 h-5 text-blue-600 transition-transform group-hover:-rotate-180 duration-500" />
      )}
    </button>
  );
}
