'use client';

import React, { useMemo } from 'react';
import { RankingWithUser } from '@/lib/types/ranking';

interface RankProgressCardProps {
  userRanking: RankingWithUser;
  allRankings: RankingWithUser[];
  className?: string;
}

/**
 * RankProgressCard - Mostra progresso do usuário para próxima posição
 * Componente interativo que calcula quanto falta economizar
 */
export function RankProgressCard({
  userRanking,
  allRankings,
  className = '',
}: RankProgressCardProps) {
  const progressData = useMemo(() => {
    const userPos = userRanking.posicao;
    const userTaxa = userRanking.economia_taxa;

    // Encontrar usuário na posição imediatamente anterior (melhor ranking)
    const nextRankUser = allRankings.find((r) => r.posicao === userPos - 1);

    if (!nextRankUser) {
      // Usuário está em primeiro lugar
      return {
        isFirstPlace: true,
        currentPosition: userPos,
        nextPosition: null,
        nextUserName: null,
        nextUserTaxa: null,
        currentTaxa: userTaxa,
        taxaDifference: 0,
        percentageNeeded: 0,
        message: 'Você é o #1! Continue economizando para manter a liderança!',
      };
    }

    const taxaDifference = nextRankUser.economia_taxa - userTaxa;
    const percentageNeeded = Math.max(0, taxaDifference);

    return {
      isFirstPlace: false,
      currentPosition: userPos,
      nextPosition: userPos - 1,
      nextUserName: nextRankUser.users.name,
      nextUserTaxa: nextRankUser.economia_taxa,
      currentTaxa: userTaxa,
      taxaDifference,
      percentageNeeded,
      message: `Economize ${percentageNeeded.toFixed(2)}% a mais para ultrapassar ${nextRankUser.users.name}`,
    };
  }, [userRanking, allRankings]);

  // Calcular progresso visual (0-100%)
  const progressPercent = progressData.isFirstPlace
    ? 100
    : Math.min(
        100,
        Math.max(
          0,
          ((progressData.currentTaxa - Math.max(0, (progressData.nextUserTaxa ?? 0) - progressData.taxaDifference)) /
            progressData.taxaDifference) *
            100
        )
      );

  const getProgressColor = (position: number) => {
    if (position <= 3) return 'from-yellow-500 to-yellow-600';
    if (position <= 10) return 'from-purple-500 to-purple-600';
    if (position <= 25) return 'from-blue-500 to-blue-600';
    return 'from-emerald-500 to-emerald-600';
  };

  return (
    <div className={`rounded-lg border dark:border-slate-700/50 light:border-gray-300 dark:bg-gradient-to-r dark:from-slate-900/50 dark:to-slate-800/50 light:bg-white light:shadow-md dark:backdrop-blur-sm p-6 transition-colors duration-200 ${className}`}>
      <h3 className="mb-6 text-lg font-bold dark:text-white light:text-gray-900">Seu Progresso</h3>

      <div className="space-y-6">
        {/* Posição Atual */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm dark:text-slate-400 light:text-gray-500 mb-1">Posição Atual</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold bg-gradient-to-r ${getProgressColor(progressData.currentPosition)} bg-clip-text text-transparent`}>
                #{progressData.currentPosition}
              </span>
              {progressData.nextPosition && (
                <span className="text-sm dark:text-slate-500 light:text-gray-400">
                  (próximo: #{progressData.nextPosition})
                </span>
              )}
            </div>
          </div>

          {/* Taxa Atual */}
          <div className="text-right">
            <p className="text-sm dark:text-slate-400 light:text-gray-500 mb-1">Taxa de Economia</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {progressData.currentTaxa.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Barra de Progresso */}
        {!progressData.isFirstPlace && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium dark:text-slate-300 light:text-gray-700">
                Progresso para #{progressData.nextPosition}
              </p>
              <p className="text-sm font-bold text-emerald-400">
                {progressPercent.toFixed(0)}%
              </p>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full dark:bg-slate-700/50 light:bg-gray-300">
              <div
                className={`h-full bg-gradient-to-r ${getProgressColor(progressData.nextPosition!)} transition-all duration-500 ease-out`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Comparação com Próximo */}
            <div className="mt-4 rounded-lg dark:border dark:border-slate-700/30 dark:bg-slate-900/30 light:border light:border-gray-300 light:bg-gray-50 p-4">
              <p className="text-xs dark:text-slate-400 light:text-gray-500 mb-3 uppercase tracking-wider">
                Próximo Rival
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold dark:text-white light:text-gray-900 truncate max-w-xs">
                    {progressData.nextUserName}
                  </p>
                  <p className="text-sm dark:text-slate-400 light:text-gray-500 mt-1">
                    Taxa: <span className="dark:text-cyan-400 light:text-blue-600 font-bold">
                      {progressData.nextUserTaxa?.toFixed(1)}%
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm dark:text-slate-400 light:text-gray-500 mb-1">Faltam</p>
                  <p className="text-2xl font-bold dark:text-yellow-400 light:text-orange-500">
                    +{progressData.taxaDifference.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem Motivacional */}
        <div className={`rounded-lg border p-4 ${
          progressData.isFirstPlace
            ? 'dark:border-yellow-500/30 dark:bg-yellow-500/10 light:border-yellow-300 light:bg-yellow-50'
            : 'dark:border-emerald-500/30 dark:bg-emerald-500/10 light:border-emerald-300 light:bg-emerald-50'
        }`}>
          <p className={`text-sm font-semibold ${
            progressData.isFirstPlace ? 'dark:text-yellow-300 light:text-yellow-700' : 'dark:text-emerald-300 light:text-emerald-700'
          }`}>
            {progressData.message}
          </p>
        </div>

        {/* Dica Extra */}
        {!progressData.isFirstPlace && (
          <div className="rounded-lg dark:border dark:border-slate-700/30 dark:bg-slate-900/30 light:border light:border-gray-300 light:bg-gray-50 p-3">
            <p className="text-xs dark:text-slate-400 light:text-gray-500">
              💡 <span className="dark:text-slate-300 light:text-gray-700">Reduzir despesas ou aumentar entradas pode ajudar a subir no ranking!</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
