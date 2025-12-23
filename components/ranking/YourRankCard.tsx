'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RankingWithUser } from '@/lib/types/ranking';
import { formatEconomia } from '@/lib/ranking';
import { BadgeGroup } from './BadgeDisplay';
import { Avatar } from '@/components/ui/avatar';
import { themeClasses } from '@/lib/theme-classes';

interface YourRankCardProps {
  ranking: RankingWithUser | null;
  loading?: boolean;
  className?: string;
}

/**
 * YourRankCard - Exibe a posição do usuário atual com animações
 * Validação rigorosa e tratamento de estados
 */
export function YourRankCard({
  ranking,
  loading = false,
  className = '',
}: YourRankCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (ranking && !loading) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [ranking?.id, loading]);

  // Loading state
  if (loading || !ranking) {
    return (
      <div
        className={`rounded-lg border-2 border-emerald-500/30 dark:bg-gradient-to-r dark:from-emerald-500/10 dark:to-cyan-500/10 light:bg-white light:shadow-sm p-6 ${className}`}
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full dark:bg-slate-800/50 light:bg-gray-200 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-24 rounded dark:bg-slate-800/50 light:bg-gray-200 animate-pulse" />
            <div className="mt-2 h-3 w-32 rounded dark:bg-slate-800/50 light:bg-gray-200 animate-pulse" />
          </div>
          <div className="text-right">
            <div className="h-6 w-16 rounded dark:bg-slate-800/50 light:bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const userName = ranking.users.name || 'User';
  const userUsername = ranking.users.username || 'user';
  const initialsFromName = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const getRankColor = (position: number) => {
    if (position <= 3) return 'from-yellow-500/30 to-yellow-600/30 border-yellow-500/50';
    if (position <= 10) return 'from-purple-500/30 to-purple-600/30 border-purple-500/50';
    if (position <= 25) return 'from-blue-500/30 to-blue-600/30 border-blue-500/50';
    return 'from-slate-900/50 to-slate-800/50 border-slate-700/50';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 3) return 'text-red-400';
    if (streak >= 2) return 'text-yellow-400';
    return 'text-slate-400';
  };

  return (
    <Link href={`/ranking/${userUsername}`}>
      <div
        className={`group relative rounded-lg border-2 border-emerald-500/50 dark:bg-gradient-to-r dark:from-emerald-500/10 dark:to-cyan-500/10 light:bg-white light:shadow-md backdrop-blur-sm p-6 transition-all duration-300 cursor-pointer dark:hover:border-emerald-500/80 light:hover:shadow-lg ${className} ${isAnimating ? 'animate-pulse' : ''}`}
      >
        {/* Label */}
        <div className="absolute -top-3 left-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          Sua Posição
        </div>

        {/* Main Content */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar
            src={ranking.users.avatar_url ?? undefined}
            initials={initialsFromName}
            size="lg"
          />

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold ${themeClasses.text.primary} truncate`}>{userName}</h3>
            <p className={`text-sm ${themeClasses.text.secondary} truncate`}>@{userUsername}</p>

            {/* Stats Row */}
            <div className="mt-3 flex gap-4">
              <div>
                <p className={`text-xs ${themeClasses.text.secondary}`}>Posição</p>
                <p className="text-2xl font-bold text-emerald-400">
                  #{ranking.posicao}
                </p>
              </div>
              <div>
                <p className={`text-xs ${themeClasses.text.secondary}`}>Taxa de Economia</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {formatEconomia(ranking.economia_taxa)}
                </p>
              </div>
              <div>
                <p className={`text-xs ${themeClasses.text.secondary}`}>Streak</p>
                <p className={`text-2xl font-bold ${getStreakColor(ranking.users.current_streak)}`}>
                  {ranking.users.current_streak} meses
                </p>
              </div>
            </div>
          </div>

          {/* Rank Badge */}
          <div
            className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border-2 dark:bg-gradient-to-br light:bg-white ${getRankColor(ranking.posicao)} dark:text-white light:text-gray-900 group-hover:scale-110 transition-transform`}
          >
            <div className="text-sm">
              <div className="text-3xl mb-1 font-bold">{ranking.posicao}</div>
              <div className="text-xs">lugar</div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        {ranking.badges && ranking.badges.length > 0 && (
          <div className={`mt-4 border-t dark:border-emerald-500/20 light:border-emerald-200 pt-4`}>
            <p className={`mb-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider`}>
              Badges Conquistados ({ranking.badges.length})
            </p>
            <BadgeGroup
              badges={ranking.badges as any}
              size="md"
              showLabel={true}
              maxDisplay={4}
              className="gap-3"
            />
          </div>
        )}

        {/* Achievement Message */}
        <div className={`mt-4 text-center text-xs ${themeClasses.text.secondary}`}>
          {ranking.posicao === 1 && (
            <p className="text-emerald-400 font-semibold">🎉 Você é o #1 do mês!</p>
          )}
          {ranking.posicao <= 3 && ranking.posicao !== 1 && (
            <p className="text-yellow-400 font-semibold">
              ✨ Parabéns! Você está entre os top 3!
            </p>
          )}
          {ranking.posicao <= 10 && ranking.posicao > 3 && (
            <p className="text-orange-500 font-semibold">Excelente posição! Top 10!</p>
          )}
          {ranking.posicao > 10 && ranking.posicao <= 25 && (
            <p className="text-blue-400 font-semibold">⭐ Você está no Top 25</p>
          )}
          {ranking.users.current_streak >= 3 && (
            <p className="mt-2 text-red-400 font-semibold">
              Streak de {ranking.users.current_streak} meses! Continue assim!
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
