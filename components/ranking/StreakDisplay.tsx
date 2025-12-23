'use client';

import React from 'react';
import { themeClasses } from '@/lib/theme-classes';

interface StreakDisplayProps {
  streak: number;
  maxStreak?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * StreakDisplay - Exibe streak de economia com animações
 * Componente visual com validação segura
 */
export function StreakDisplay({
  streak = 0,
  maxStreak = 12,
  className = '',
  size = 'md',
}: StreakDisplayProps) {
  // Validação segura
  const validStreak = Math.max(0, Math.min(streak, maxStreak));
  const percentage = (validStreak / maxStreak) * 100;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm gap-2',
    md: 'px-4 py-3 text-base gap-3',
    lg: 'px-6 py-4 text-lg gap-4',
  };

  const fireSize = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const barHeight = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div
      className={`rounded-lg border border-red-500/30 dark:bg-gradient-to-r dark:from-red-500/10 dark:to-orange-500/10 backdrop-blur-sm ${sizeClasses[size]} ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-orange-500">●</span>
          <div>
            <p className={`text-xs ${themeClasses.text.secondary} font-medium`}>Streak Atual</p>
            <p className="text-lg font-bold text-red-400">
              {validStreak} {validStreak === 1 ? 'mês' : 'meses'}
            </p>
          </div>
        </div>

        {/* Milestone Badge */}
        {validStreak >= 3 && (
          <div className="rounded-full bg-red-500/20 border border-red-500/50 px-3 py-1">
            <p className="text-xs font-semibold text-red-400">
              +{validStreak - 2} após 3
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className={`text-xs ${themeClasses.text.secondary}`}>Progresso para {maxStreak}</p>
          <p className={`text-xs ${themeClasses.text.secondary} font-semibold`}>
            {Math.round(percentage)}%
          </p>
        </div>

        {/* Bar Background */}
        <div className={`w-full rounded-full dark:bg-slate-900/50 dark:border-slate-700/50 border overflow-hidden ${barHeight[size]}`}>
          {/* Bar Fill */}
          <div
            className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-800 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Milestones */}
      {validStreak > 0 && (
        <div className={`mt-3 pt-3 dark:border-slate-700/30 border-t space-y-2`}>
          <div className={`text-xs ${themeClasses.text.secondary}`}>
            {validStreak === 1 && (
              <p>Ótimo! Você começou sua jornada de economia!</p>
            )}
            {validStreak === 2 && (
              <p>Vamos lá! Mais um mês para bater a marca de 3!</p>
            )}
            {validStreak === 3 && (
              <p>Parabéns! Você atingiu 3 meses de streak!</p>
            )}
            {validStreak > 3 && validStreak < 6 && (
              <p>Incrível! {validStreak} meses consecutivos economizando!</p>
            )}
            {validStreak >= 6 && validStreak < 12 && (
              <p>Você é um expert em economia! {validStreak} meses!</p>
            )}
            {validStreak >= 12 && (
              <p>LENDA! Um ano inteiro de economia consistente!</p>
            )}
          </div>
        </div>
      )}

      {validStreak === 0 && (
        <div className={`mt-2 text-xs ${themeClasses.text.secondary} italic`}>
          Comece a economizar para iniciar seu streak!
        </div>
      )}
    </div>
  );
}

interface StreakGridProps {
  streak: number;
  className?: string;
}

/**
 * StreakGrid - Visualização em grid dos meses de streak
 */
export function StreakGrid({ streak = 0, className = '' }: StreakGridProps) {
  const validStreak = Math.max(0, Math.min(streak, 12));
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div
      className={`rounded-lg dark:border-slate-700/50 border dark:bg-gradient-to-r dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-sm p-4 ${className}`}
    >
      <p className={`mb-4 text-sm font-semibold ${themeClasses.text.primary}`}>Últimos 12 Meses</p>

      <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
        {months.map((month) => (
          <div
            key={month}
            className={`aspect-square rounded-lg border transition-all ${
              month <= validStreak
                ? 'bg-gradient-to-br from-orange-500/50 to-orange-600/50 border-orange-500/50'
                : 'dark:bg-slate-800/50 dark:border-slate-700/50'
            }`}
            style={{ animation: `fadeIn 0.5s ease-out ${month * 0.05}s both` }}
            title={month <= validStreak ? `Mês ${month} - Economizando` : `Mês ${month}`}
          >
            <div className="flex h-full items-center justify-center text-center">
              <span className={`text-lg font-bold ${month <= validStreak ? 'text-white' : 'dark:text-slate-500'}`}>
                {month <= validStreak ? '✓' : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className={`mt-4 flex items-center justify-center gap-6 text-xs ${themeClasses.text.secondary}`}>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded text-xs font-bold text-white bg-orange-500">✓</span>
          <span>Mês com economia</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-4 w-4 items-center justify-center rounded dark:bg-slate-700 text-xs`}>—</span>
          <span>Sem economia</span>
        </div>
      </div>
    </div>
  );
}
