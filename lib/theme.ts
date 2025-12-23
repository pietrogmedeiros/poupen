// Postman-inspired color palette
export const themeColors = {
  dark: {
    // Backgrounds
    bg: {
      primary: '#0f1419',
      secondary: '#1a1f2e',
      tertiary: '#1e2835',
      hover: '#252d3d',
    },
    // Text
    text: {
      primary: '#e4e4e7',
      secondary: '#a1a1aa',
      tertiary: '#71717a',
    },
    // Borders
    border: {
      primary: '#3a4556',
      secondary: '#4a5568',
    },
    // Accents
    accent: {
      primary: '#ff6b35',   // Orange vibrante
      secondary: '#4a9eff', // Blue
      purple: '#9b59b6',    // Purple
    },
    // Status colors
    status: {
      success: '#10b981',   // Green
      warning: '#f59e0b',   // Amber
      error: '#ef4444',     // Red
      info: '#3b82f6',      // Blue
    },
  },
  light: {
    // Backgrounds
    bg: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      hover: '#e5e7eb',
    },
    // Text
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
    },
    // Borders
    border: {
      primary: '#e5e7eb',
      secondary: '#d1d5db',
    },
    // Accents
    accent: {
      primary: '#ff6b35',   // Orange mantido
      secondary: '#2563eb', // Blue mais intenso
      purple: '#7c3aed',    // Purple mais intenso
    },
    // Status colors
    status: {
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#1d4ed8',
    },
  },
};

export type Theme = 'light' | 'dark';

export function getThemeColors(theme: Theme) {
  return themeColors[theme];
}

export const themeConfig = {
  defaultTheme: 'dark' as const,
  storageKey: 'poupen-theme',
  attribute: 'class' as const,
  enableSystem: true,
  disableTransitionOnChange: false,
  storageEnableFallback: true,
};
