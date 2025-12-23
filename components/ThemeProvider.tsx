'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode } from 'react';
import { themeConfig } from '@/lib/theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute={themeConfig.attribute}
      defaultTheme={themeConfig.defaultTheme}
      enableSystem={themeConfig.enableSystem}
      disableTransitionOnChange={themeConfig.disableTransitionOnChange}
      storageKey={themeConfig.storageKey}
      enableColorScheme={true}
      forcedTheme={undefined}
      themes={['light', 'dark']}
    >
      {children}
    </NextThemesProvider>
  );
}
