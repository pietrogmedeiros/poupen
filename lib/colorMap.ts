// Mapa de cores para páginas e componentes
// Usando valores exatos de gradientes para evitar problemas com classes dinâmicas do Tailwind

export const pageColors = {
  dashboard: {
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #06b6d4 100%)',
    title: 'from-blue-400 via-indigo-400 to-purple-400',
  },
  entradas: {
    gradient: 'linear-gradient(135deg, #22c55e 0%, #059669 100%)',
    title: 'from-green-400 via-emerald-400 to-green-500',
  },
  despesas: {
    gradient: 'linear-gradient(135deg, #ef4444 0%, #ea580c 100%)',
    title: 'from-red-400 via-orange-400 to-red-500',
  },
  recorridos: {
    gradient: 'linear-gradient(135deg, #eab308 0%, #b45309 100%)',
    title: 'from-yellow-500 to-amber-600',
  },
  historico: {
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
    title: 'from-blue-400 via-indigo-400 to-purple-400',
  },
  comprovante: {
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
    title: 'from-cyan-400 via-blue-400 to-blue-500',
  },
  configuracoes: {
    gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    title: 'from-slate-400 to-slate-600',
  },
};

export const gradients = {
  blue: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
  green: 'linear-gradient(135deg, #22c55e 0%, #059669 100%)',
  red: 'linear-gradient(135deg, #ef4444 0%, #ea580c 100%)',
  yellow: 'linear-gradient(135deg, #eab308 0%, #b45309 100%)',
  purple: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
  cyan: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
  slate: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
};
