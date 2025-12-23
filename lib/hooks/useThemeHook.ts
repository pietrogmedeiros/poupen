'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { getThemeColors, type Theme } from '@/lib/theme';

interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  colors: ReturnType<typeof getThemeColors>;
  mounted: boolean;
  isDark: boolean;
}

export function useThemeHook(): UseThemeReturn {
  const [mounted, setMounted] = useState(false);
  const { theme: nextTheme, setTheme: setNextTheme, systemTheme } = useNextTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determinar tema atual
  const theme = ((nextTheme === 'system' ? systemTheme : nextTheme) || 'dark') as Theme;

  const colors = getThemeColors(theme);

  const toggleTheme = () => {
    setNextTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return {
    theme,
    setTheme: (newTheme: Theme) => setNextTheme(newTheme),
    toggleTheme,
    colors,
    mounted,
    isDark: theme === 'dark',
  };
}
