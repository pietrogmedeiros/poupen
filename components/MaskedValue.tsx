import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface MaskedValueProps {
  value: string | number;
  isVisible: boolean;
  onToggle: () => void;
  blurred?: boolean;
  className?: string;
}

export const MaskedValue = React.forwardRef<HTMLDivElement, MaskedValueProps>(
  ({ value, isVisible, onToggle, blurred = false, className = '' }, ref) => {
    // Converter para string e contar caracteres
    const valueStr = value.toString();
    const maskLength = Math.max(valueStr.length, 8);
    
    return (
      <span ref={ref as any} className={`inline-flex items-center gap-2 group ${className}`}>
        <span className={`relative ${isVisible ? '' : blurred ? 'blur-sm' : ''}`}>
          <span className={isVisible ? 'text-inherit' : 'select-none'}>
            {isVisible ? value : '•'.repeat(maskLength)}
          </span>
        </span>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
          title={isVisible ? 'Ocultar valor' : 'Mostrar valor'}
        >
          {isVisible ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </button>
      </span>
    );
  }
);

MaskedValue.displayName = 'MaskedValue';
