'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useValueVisibility } from '@/lib/ValueVisibilityContext';

export function ValueVisibilityToggle() {
  const { isValuesVisible, toggleValuesVisibility } = useValueVisibility();

  return (
    <button
      onClick={toggleValuesVisibility}
      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600/50 transition-all duration-200 font-medium text-sm"
      title={isValuesVisible ? 'Ocultar valores' : 'Mostrar valores'}
    >
      {isValuesVisible ? (
        <>
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Ocultar</span>
        </>
      ) : (
        <>
          <EyeOff className="w-4 h-4" />
          <span className="hidden sm:inline">Mostrar</span>
        </>
      )}
    </button>
  );
}
