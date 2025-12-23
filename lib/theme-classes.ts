/**
 * Utilidade para classes de tema dark/light
 * Simplifica a aplicação de Tailwind dark: e light: modifiers
 */

export const themeClasses = {
  // Containers
  card: {
    border: 'dark:border-slate-700/50 light:border-gray-300',
    bg: 'dark:bg-slate-900/50 light:bg-white',
    bgGradient: 'dark:bg-gradient-to-r dark:from-slate-900/50 dark:to-slate-800/50 light:bg-white light:shadow-sm',
  },

  // Text
  text: {
    primary: 'dark:text-white light:text-gray-900',
    secondary: 'dark:text-slate-300 light:text-gray-700',
    tertiary: 'dark:text-slate-400 light:text-gray-500',
  },

  // Backgrounds
  bg: {
    primary: 'dark:bg-slate-950 light:bg-white',
    secondary: 'dark:bg-slate-900 light:bg-gray-50',
    tertiary: 'dark:bg-slate-800 light:bg-gray-100',
    hover: 'dark:bg-slate-800/50 light:bg-gray-100/50',
  },

  // Borders
  border: {
    primary: 'dark:border-slate-700 light:border-gray-300',
    secondary: 'dark:border-slate-700/50 light:border-gray-300/50',
    subtle: 'dark:border-slate-700/30 light:border-gray-200',
  },

  // Inputs & Selects
  input: 'dark:bg-slate-900/50 dark:border-slate-700 dark:text-white light:bg-white light:border-gray-300 light:text-gray-900',

  // Status colors (responsive)
  status: {
    success: 'dark:text-green-400 light:text-green-600',
    warning: 'dark:text-yellow-400 light:text-yellow-600',
    error: 'dark:text-red-400 light:text-red-600',
    info: 'dark:text-blue-400 light:text-blue-600',
  },

  // Gradients
  gradients: {
    primary: 'dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:from-white light:via-gray-50 light:to-gray-100',
    accent: 'dark:from-emerald-500 dark:to-cyan-500 light:from-emerald-600 light:to-teal-600',
  },

  // Cards
  cardContainer: `
    rounded-lg 
    dark:border-slate-700/50 light:border-gray-300
    dark:bg-gradient-to-r dark:from-slate-900/50 dark:to-slate-800/50
    light:bg-white light:shadow-sm
    dark:backdrop-blur-sm
    p-6
    transition-colors duration-200
  `,
};

/**
 * Merge theme classes com className customizado
 */
export function mergeThemeClasses(
  themeClass: string,
  customClass?: string
): string {
  return `${themeClass} ${customClass || ''}`.trim();
}
