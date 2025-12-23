'use client';

import React, { useState, useMemo } from 'react';
import { RankingWithUser } from '@/lib/types/ranking';
import { formatEconomia } from '@/lib/ranking';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { themeClasses } from '@/lib/theme-classes';

interface HeadToHeadCardProps {
  userRanking: RankingWithUser;
  allRankings: RankingWithUser[];
  className?: string;
}

/**
 * HeadToHeadCard - Compara taxa de economia com outro usuário
 * Componente interativo com seleção de rival
 */
export function HeadToHeadCard({
  userRanking,
  allRankings,
  className = '',
}: HeadToHeadCardProps) {
  // Excluir o usuário atual da lista de possíveis rivais
  const rivals = useMemo(
    () => allRankings.filter((r) => r.user_id !== userRanking.user_id),
    [allRankings, userRanking.user_id]
  );

  // Sugerir rival: usuário na posição imediatamente anterior
  const suggestedRival = useMemo(() => {
    return rivals.find((r) => r.posicao === userRanking.posicao - 1) || rivals[0];
  }, [rivals, userRanking.posicao]);

  const [selectedRivalId, setSelectedRivalId] = useState<string | null>(
    suggestedRival?.user_id || null
  );

  const selectedRival = useMemo(
    () => rivals.find((r) => r.user_id === selectedRivalId) || null,
    [rivals, selectedRivalId]
  );

  if (!selectedRival) {
    return null;
  }

  const userTaxa = userRanking.economia_taxa;
  const rivalTaxa = selectedRival.economia_taxa;
  const difference = userTaxa - rivalTaxa;
  const isUserAhead = difference > 0;
  const progressPercent = Math.max(0, Math.min(100, ((userTaxa / rivalTaxa) * 50) + 25));

  return (
    <div className={`rounded-lg ${themeClasses.border.primary} dark:bg-gradient-to-r dark:from-slate-900/50 dark:to-slate-800/50 light:bg-white light:shadow-sm dark:backdrop-blur-sm p-6 ${className}`}>
      <h3 className="mb-4 text-lg font-bold dark:text-white light:text-gray-900">⚔️ Duelo Direto</h3>

      {/* Seletor de Rival */}
      <div className="mb-6">
        <label className="text-xs dark:text-slate-400 light:text-gray-500 uppercase tracking-wider mb-2 block">
          Escolha um Rival
        </label>
        <select
          value={selectedRivalId || ''}
          onChange={(e) => setSelectedRivalId(e.target.value)}
          className={`w-full rounded-lg ${themeClasses.border.primary} ${themeClasses.input} px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`}
        >
          <option value="">Selecione um rival...</option>
          {rivals.map((rival) => (
            <option key={rival.user_id} value={rival.user_id}>
              #{rival.posicao} - {rival.users.name} ({rival.economia_taxa.toFixed(1)}%)
            </option>
          ))}
        </select>
      </div>

      {/* Comparação Visual */}
      <div className="space-y-4">
        {/* Headers */}
        <div className="grid grid-cols-2 gap-4">
          {/* Usuário */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
            <Avatar
              src={userRanking.users.avatar_url || undefined}
              alt={userRanking.users.name}
              className="h-10 w-10"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Você</p>
              <p className="text-xs text-slate-400">
                #{userRanking.posicao}
              </p>
            </div>
          </div>

          {/* Rival */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-purple-500/30 bg-purple-500/10">
            <Avatar
              src={selectedRival.users.avatar_url || undefined}
              alt={selectedRival.users.name}
              className="h-10 w-10"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {selectedRival.users.name.split(' ')[0]}
              </p>
              <p className="text-xs text-slate-400">
                #{selectedRival.posicao}
              </p>
            </div>
          </div>
        </div>

        {/* Taxa de Economia */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-4 text-center">
            <p className="text-xs text-slate-400 mb-2">Taxa</p>
            <p className={`text-3xl font-bold ${isUserAhead ? 'text-emerald-400' : 'text-red-400'}`}>
              {userTaxa.toFixed(1)}%
            </p>
          </div>

          <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-4 text-center">
            <p className="text-xs text-slate-400 mb-2">Taxa</p>
            <p className={`text-3xl font-bold ${!isUserAhead ? 'text-emerald-400' : 'text-red-400'}`}>
              {rivalTaxa.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Barra de Comparação */}
        <div className="space-y-2">
          <p className="text-xs text-slate-400 font-medium">Vantagem</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/50">
            <div
              className={`h-full bg-gradient-to-r ${
                isUserAhead
                  ? 'from-emerald-500 to-emerald-600'
                  : 'from-purple-500 to-purple-600'
              } transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className={`text-sm font-bold ${isUserAhead ? 'text-emerald-400' : 'text-purple-400'}`}>
            {isUserAhead ? '+' : ''}{difference.toFixed(2)}% {isUserAhead ? 'na frente' : 'atrás'}
          </p>
        </div>

        {/* Resultado */}
        <div className={`rounded-lg border p-4 ${
          isUserAhead
            ? 'border-emerald-500/30 bg-emerald-500/10'
            : 'border-purple-500/30 bg-purple-500/10'
        }`}>
          <p className={`text-sm font-semibold ${isUserAhead ? 'text-emerald-300' : 'text-purple-300'}`}>
            {isUserAhead
              ? `🎯 Você está na frente! ${Math.abs(difference).toFixed(2)}% de vantagem.`
              : `⚡ ${selectedRival.users.name} está na frente. Você precisa de +${Math.abs(difference).toFixed(2)}% para alcançá-lo.`}
          </p>
        </div>

        {/* Badges Comparação */}
        {(userRanking.badges.length > 0 || selectedRival.badges.length > 0) && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Seus Badges</p>
              <div className="flex flex-wrap gap-1">
                {userRanking.badges.length > 0 ? (
                  userRanking.badges.slice(0, 3).map((badge) => (
                    <Badge key={badge} variant="outline" className="text-xs">
                      {badge}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Nenhum ainda</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Badges do Rival</p>
              <div className="flex flex-wrap gap-1">
                {selectedRival.badges.length > 0 ? (
                  selectedRival.badges.slice(0, 3).map((badge) => (
                    <Badge key={badge} variant="outline" className="text-xs">
                      {badge}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Nenhum ainda</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
