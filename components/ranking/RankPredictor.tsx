'use client';

import React, { useMemo, useState } from 'react';
import { RankingWithUser } from '@/lib/types/ranking';

interface RankPredictorProps {
  userRanking: RankingWithUser;
  allRankings: RankingWithUser[];
  currentEconomyData?: {
    entradas_total: number;
    despesas_total: number;
  };
  className?: string;
}

/**
 * RankPredictor - Prediz posição futura baseado em diferentes cenários
 * Componente interativo que mostra impacto de metas de economia
 */
export function RankPredictor({
  userRanking,
  allRankings,
  currentEconomyData,
  className = '',
}: RankPredictorProps) {
  const [scenarioTaxa, setScenarioTaxa] = useState<number>(userRanking.economia_taxa);

  const prediction = useMemo(() => {
    // Cálculo de posição se o usuário tiver uma taxa diferente
    const hypotheticalRankings = [...allRankings].map((r) =>
      r.user_id === userRanking.user_id
        ? { ...r, economia_taxa: scenarioTaxa }
        : r
    );

    // Ordenar por taxa
    hypotheticalRankings.sort((a, b) => b.economia_taxa - a.economia_taxa);

    // Encontrar nova posição
    const newPosition =
      hypotheticalRankings.findIndex((r) => r.user_id === userRanking.user_id) + 1;
    const positionChange = userRanking.posicao - newPosition;
    const taxaChange = scenarioTaxa - userRanking.economia_taxa;

    // Calcular quantas pessoas ficaria na frente/atrás
    const usersAhead = allRankings.filter((r) => r.economia_taxa > scenarioTaxa).length;
    const usersBelow = allRankings.filter((r) => r.economia_taxa < scenarioTaxa).length;

    return {
      newPosition,
      positionChange,
      taxaChange,
      usersAhead,
      usersBelow,
      improvement: newPosition < userRanking.posicao,
    };
  }, [scenarioTaxa, userRanking, allRankings]);

  const getPositionColor = (position: number) => {
    if (position <= 3) return 'from-yellow-500 to-yellow-600';
    if (position <= 10) return 'from-purple-500 to-purple-600';
    if (position <= 25) return 'from-blue-500 to-blue-600';
    return 'from-emerald-500 to-emerald-600';
  };

  const getTaxaColor = (taxa: number) => {
    if (taxa >= 75) return 'text-emerald-400';
    if (taxa >= 50) return 'text-yellow-400';
    if (taxa >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className={`rounded-lg border border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm p-6 ${className}`}>
      <h3 className="mb-6 text-lg font-bold text-white">🔮 Preditor de Ranking</h3>

      <div className="space-y-6">
        {/* Slider de Taxa */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">
              Simule sua taxa de economia
            </label>
            <span className={`text-2xl font-bold ${getTaxaColor(scenarioTaxa)}`}>
              {scenarioTaxa.toFixed(1)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={scenarioTaxa}
            onChange={(e) => setScenarioTaxa(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Comparação */}
        <div className="grid grid-cols-2 gap-4">
          {/* Atual */}
          <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-4">
            <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider">Atual</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Posição</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  #{userRanking.posicao}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Taxa</p>
                <p className={`text-2xl font-bold ${getTaxaColor(userRanking.economia_taxa)}`}>
                  {userRanking.economia_taxa.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Predito */}
          <div className={`rounded-lg border p-4 ${
            prediction.improvement
              ? 'border-emerald-500/30 bg-emerald-500/10'
              : prediction.positionChange < 0
              ? 'border-red-500/30 bg-red-500/10'
              : 'border-slate-700/30 bg-slate-900/30'
          }`}>
            <p className="text-xs uppercase tracking-wider mb-3 font-medium">
              {prediction.improvement ? '✨ Melhorado' : 'Predito'}
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Posição</p>
                <div className="flex items-center gap-2">
                  <p className={`text-3xl font-bold bg-gradient-to-r ${getPositionColor(prediction.newPosition)} bg-clip-text text-transparent`}>
                    #{prediction.newPosition}
                  </p>
                  {prediction.positionChange !== 0 && (
                    <span className={`text-lg font-bold ${prediction.positionChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {prediction.positionChange > 0 ? '↑' : '↓'}{Math.abs(prediction.positionChange)}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Taxa</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${getTaxaColor(scenarioTaxa)}`}>
                    {scenarioTaxa.toFixed(1)}%
                  </p>
                  {prediction.taxaChange !== 0 && (
                    <span className={`text-sm font-bold ${prediction.taxaChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {prediction.taxaChange > 0 ? '+' : ''}{prediction.taxaChange.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insight */}
        <div className={`rounded-lg border p-4 ${
          prediction.improvement
            ? 'border-emerald-500/30 bg-emerald-500/10'
            : 'border-slate-700/30 bg-slate-900/30'
        }`}>
          <p className={`text-sm font-semibold ${
            prediction.improvement ? 'text-emerald-300' : 'text-slate-300'
          }`}>
            {prediction.improvement
              ? `🚀 Com ${scenarioTaxa.toFixed(1)}% de economia, você ultrapassaria ${Math.abs(prediction.positionChange)} ${Math.abs(prediction.positionChange) === 1 ? 'pessoa' : 'pessoas'}!`
              : prediction.positionChange > 0
              ? `📉 Reduzindo para ${scenarioTaxa.toFixed(1)}%, você caíria ${Math.abs(prediction.positionChange)} posições.`
              : `➡️ Com ${scenarioTaxa.toFixed(1)}%, sua posição permaneceria similar.`}
          </p>
        </div>

        {/* Stats Adicionais */}
        <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-700/50 pt-4">
          <div className="rounded border border-slate-700/30 bg-slate-900/30 p-3">
            <p className="text-slate-500 mb-1">Pessoas à Frente</p>
            <p className="text-2xl font-bold text-purple-400">{prediction.usersAhead}</p>
          </div>

          <div className="rounded border border-slate-700/30 bg-slate-900/30 p-3">
            <p className="text-slate-500 mb-1">Pessoas Atrás</p>
            <p className="text-2xl font-bold text-blue-400">{prediction.usersBelow}</p>
          </div>
        </div>

        {/* Dica */}
        <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-3">
          <p className="text-xs text-slate-400">
            💡 <span className="text-slate-300">Mova o slider para simular diferentes cenários e veja como sua posição mudaria!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
