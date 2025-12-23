'use client';

import React, { useMemo } from 'react';
import { themeClasses } from '@/lib/theme-classes';

interface HistoryDataPoint {
  month: string;
  posicao: number;
  economia_taxa: number;
}

interface RankHistoryChartProps {
  userHistory: HistoryDataPoint[];
  className?: string;
}

/**
 * RankHistoryChart - Exibe histórico de ranking em gráfico visual
 * Componente com animação suave e interatividade
 */
export function RankHistoryChart({
  userHistory,
  className = '',
}: RankHistoryChartProps) {
  const chartData = useMemo(() => {
    if (userHistory.length === 0) return null;

    // Ordenar por mês
    const sorted = [...userHistory].sort((a, b) => a.month.localeCompare(b.month));
    
    const maxPos = Math.max(...sorted.map((d) => d.posicao)) + 2;
    const minTaxa = Math.min(...sorted.map((d) => d.economia_taxa)) - 5;
    const maxTaxa = Math.max(...sorted.map((d) => d.economia_taxa)) + 5;

    return {
      sorted,
      maxPos,
      minTaxa: Math.max(0, minTaxa),
      maxTaxa: Math.min(100, maxTaxa),
      range: maxTaxa - Math.max(0, minTaxa),
    };
  }, [userHistory]);

  if (!chartData || chartData.sorted.length === 0) {
    return (
      <div className={`rounded-lg ${themeClasses.border.primary} dark:bg-gradient-to-r dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-sm p-6 ${className}`}>
        <h3 className={`mb-4 text-lg font-bold ${themeClasses.text.primary}`}>📈 Histórico de Ranking</h3>
        <p className={`${themeClasses.text.secondary} text-center py-8`}>
          Dados históricos aparecerão aqui quando você tiver múltiplos períodos de ranking.
        </p>
      </div>
    );
  }

  const getPositionColor = (position: number) => {
    if (position <= 3) return '#FFD700';
    if (position <= 10) return '#60A5FA';
    if (position <= 25) return '#34D399';
    return '#A78BFA';
  };

  const getTaxaColor = (taxa: number) => {
    if (taxa >= 75) return '#10B981';
    if (taxa >= 50) return '#F59E0B';
    if (taxa >= 25) return '#EF4444';
    return '#6B7280';
  };

  return (
    <div className={`rounded-lg ${themeClasses.border.primary} dark:bg-gradient-to-r dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-sm p-6 ${className}`}>
      <h3 className={`mb-6 text-lg font-bold ${themeClasses.text.primary}`}>📈 Histórico de Ranking</h3>

      <div className="space-y-8">
        {/* Gráfico de Posição */}
        <div>
          <h4 className={`text-sm font-semibold ${themeClasses.text.primary} mb-3`}>Evolução de Posição</h4>
          <div className="flex items-end justify-between gap-2 h-40">
            {chartData.sorted.map((data, index) => {
              const heightPercent = ((chartData.maxPos - data.posicao) / chartData.maxPos) * 100;
              return (
                <div
                  key={data.month}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <div
                    className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: getPositionColor(data.posicao),
                      minHeight: '8px',
                    }}
                    title={`${data.month}: #${data.posicao}`}
                  />
                  <span className={`text-xs ${themeClasses.text.secondary} text-center truncate max-w-full w-full px-1`}>
                    {data.month}
                  </span>
                  <span className={`text-xs font-bold dark:text-slate-300 dark:group-hover:text-white transition-colors`}>
                    #{data.posicao}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico de Taxa */}
        <div>
          <h4 className={`text-sm font-semibold ${themeClasses.text.primary} mb-3`}>Taxa de Economia</h4>
          <div className="flex items-end justify-between gap-2 h-40">
            {chartData.sorted.map((data) => {
              const heightPercent = ((data.economia_taxa - chartData.minTaxa) / chartData.range) * 100;
              return (
                <div
                  key={data.month}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <div
                    className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{
                      height: `${Math.max(heightPercent, 10)}%`,
                      backgroundColor: getTaxaColor(data.economia_taxa),
                      minHeight: '8px',
                    }}
                    title={`${data.month}: ${data.economia_taxa.toFixed(1)}%`}
                  />
                  <span className={`text-xs ${themeClasses.text.secondary} text-center truncate max-w-full w-full px-1`}>
                    {data.month}
                  </span>
                  <span className={`text-xs font-bold dark:text-slate-300 dark:group-hover:text-white transition-colors`}>
                    {data.economia_taxa.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats de Evolução */}
        <div className={`grid grid-cols-2 gap-4 pt-4 dark:border-slate-700/50 border-t`}>
          <div className={`rounded-lg dark:border-slate-700/30 dark:bg-slate-900/30 border p-3`}>
            <p className={`text-xs ${themeClasses.text.secondary} mb-1`}>Melhor Posição</p>
            <p className="text-2xl font-bold text-emerald-400">
              #{Math.min(...chartData.sorted.map((d) => d.posicao))}
            </p>
          </div>

          <div className={`rounded-lg dark:border-slate-700/30 dark:bg-slate-900/30 border p-3`}>
            <p className={`text-xs ${themeClasses.text.secondary} mb-1`}>Melhor Taxa</p>
            <p className="text-2xl font-bold text-cyan-400">
              {Math.max(...chartData.sorted.map((d) => d.economia_taxa)).toFixed(1)}%
            </p>
          </div>

          <div className={`rounded-lg dark:border-slate-700/30 dark:bg-slate-900/30 border p-3`}>
            <p className={`text-xs ${themeClasses.text.secondary} mb-1`}>Períodos Registrados</p>
            <p className="text-2xl font-bold text-purple-400">
              {chartData.sorted.length}
            </p>
          </div>

          <div className={`rounded-lg dark:border-slate-700/30 dark:bg-slate-900/30 border p-3`}>
            <p className={`text-xs ${themeClasses.text.secondary} mb-1`}>Média de Taxa</p>
            <p className="text-2xl font-bold text-yellow-400">
              {(
                chartData.sorted.reduce((sum, d) => sum + d.economia_taxa, 0) /
                chartData.sorted.length
              ).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
