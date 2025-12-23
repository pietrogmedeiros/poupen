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

export function HeadToHeadCard({
  userRanking,
  allRankings,
  className = '',
}: HeadToHeadCardProps) {
  const rivals = useMemo(
    () => allRankings.filter((r) => r.user_id !== userRanking.user_id),
    [allRankings, userRanking.user_id]
  );

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
    <div className={`rounded-lg ${themeClasses.border.primary} dark:bg-gradient-to-r dark:from-slate-900/50 dark:to-slate-800/50 light:bg-white light:shadow-sm dark:backdrop-blur-sm p-6 transition-colors duration-200 ${className}`}>
      <h3 className={`mb-4 text-lg font-bold ${themeClasses.text.primary}`}>⚔️ Duelo Direto</h3>

      <div className="mb-6">
        <label className={`text-xs ${themeClasses.text.tertiary} uppercase tracking-wider mb-2 block`}>
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

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className={`flex items-center gap-3 p-3 rounded-lg dark:border-emerald-500/30 dark:bg-emerald-500/10 light:border-emerald-300 light:bg-emerald-50`}>
            <Avatar
              src={userRanking.users.avatar_url || undefined}
              alt={userRanking.users.name}
              className="h-10 w-10"
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${themeClasses.text.primary} truncate`}>Você</p>
              <p className={`text-xs ${themeClasses.text.tertiary}`}>
                #{userRanking.posicao}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-lg dark:border-purple-500/30 dark:bg-purple-500/10 light:border-purple-300 light:bg-purple-50`}>
            <Avatar
              src={selectedRival.users.avatar_url || undefined}
              alt={selectedRival.users.name}
              className="h-10 w-10"
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${themeClasses.text.primary} truncate`}>
                {selectedRival.users.name.split(' ')[0]}
              </p>
              <p className={`text-xs ${themeClasses.text.tertiary}`}>
                #{selectedRival.posicao}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-lg ${themeClasses.border.subtle} ${themeClasses.bg.secondary} p-4 text-center transition-colors duration-200`}>
            <p className={`text-xs ${themeClasses.text.tertiary} mb-2`}>Taxa</p>
            <p className={`text-3xl font-bold ${isUserAhead ? 'dark:text-emerald-400 light:text-emerald-600' : 'dark:text-red-400 light:text-red-600'}`}>
              {userTaxa.toFixed(1)}%
            </p>
          </div>

          <div className={`rounded-lg ${themeClasses.border.subtle} ${themeClasses.bg.secondary} p-4 text-center transition-colors duration-200`}>
            <p className={`text-xs ${themeClasses.text.tertiary} mb-2`}>Taxa</p>
            <p className={`text-3xl font-bold ${!isUserAhead ? 'dark:text-emerald-400 light:text-emerald-600' : 'dark:text-red-400 light:text-red-600'}`}>
              {rivalTaxa.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className={`text-xs ${themeClasses.text.tertiary} font-medium`}>Vantagem</p>
          <div className={`h-2 w-full overflow-hidden rounded-full dark:bg-slate-700/50 light:bg-gray-300`}>
            <div
              className={`h-full bg-gradient-to-r ${
                isUserAhead
                  ? 'from-emerald-500 to-emerald-600'
                  : 'from-purple-500 to-purple-600'
              } transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className={`text-sm font-bold ${isUserAhead ? 'dark:text-emerald-400 light:text-emerald-600' : 'dark:text-purple-400 light:text-purple-600'}`}>
            {isUserAhead ? '+' : ''}{difference.toFixed(2)}% {isUserAhead ? 'na frente' : 'atrás'}
          </p>
        </div>

        <div className={`rounded-lg border p-4 transition-colors duration-200 ${
          isUserAhead
            ? 'dark:border-emerald-500/30 dark:bg-emerald-500/10 light:border-emerald-300 light:bg-emerald-50'
            : 'dark:border-purple-500/30 dark:bg-purple-500/10 light:border-purple-300 light:bg-purple-50'
        }`}>
          <p className={`text-sm font-semibold ${isUserAhead ? 'dark:text-emerald-300 light:text-emerald-700' : 'dark:text-purple-300 light:text-purple-700'}`}>
            {isUserAhead
              ? `🎯 Você está na frente! ${Math.abs(difference).toFixed(2)}% de vantagem.`
              : `⚡ ${selectedRival.users.name} está na frente. Você precisa de +${Math.abs(difference).toFixed(2)}% para alcançá-lo.`}
          </p>
        </div>

        {(userRanking.badges.length > 0 || selectedRival.badges.length > 0) && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className={`text-xs ${themeClasses.text.tertiary} mb-2 font-medium`}>Seus Badges</p>
              <div className="flex flex-wrap gap-1">
                {userRanking.badges.length > 0 ? (
                  userRanking.badges.slice(0, 3).map((badge) => (
                    <Badge key={badge} variant="outline" className="text-xs">
                      {badge}
                    </Badge>
                  ))
                ) : (
                  <p className={`text-xs ${themeClasses.text.tertiary}`}>Nenhum ainda</p>
                )}
              </div>
            </div>

            <div>
              <p className={`text-xs ${themeClasses.text.tertiary} mb-2 font-medium`}>Badges do Rival</p>
              <div className="flex flex-wrap gap-1">
                {selectedRival.badges.length > 0 ? (
                  selectedRival.badges.slice(0, 3).map((badge) => (
                    <Badge key={badge} variant="outline" className="text-xs">
                      {badge}
                    </Badge>
                  ))
                ) : (
                  <p className={`text-xs ${themeClasses.text.tertiary}`}>Nenhum ainda</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
