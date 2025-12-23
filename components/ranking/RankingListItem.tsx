'use client';

import React from 'react';
import Link from 'next/link';
import { RankingWithUser } from '@/lib/types/ranking';
import { formatEconomia } from '@/lib/ranking';
import { BadgeGroup } from './BadgeDisplay';
import { Avatar } from '@/components/ui/avatar';
import { themeClasses } from '@/lib/theme-classes';

interface RankingListItemProps {
  ranking: RankingWithUser;
  isUserRanking?: boolean;
  isTop3?: boolean;
  animated?: boolean;
  onClick?: (ranking: RankingWithUser) => void;
}

export function RankingListItem({
  ranking,
  isUserRanking = false,
  isTop3 = false,
  animated = true,
  onClick,
}: RankingListItemProps) {
  const getRankMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
      case 2:
        return 'from-slate-400/20 to-slate-500/20 border-slate-400/50';
      case 3:
        return 'from-orange-500/20 to-orange-600/20 border-orange-500/50';
      default:
        return 'from-slate-900/50 to-slate-800/50 border-slate-700/50';
    }
  };

  const getRankMedal = (position: number) => {
    switch (position) {
      case 1:
        return '1º'
      case 2:
        return '2º'
      case 3:
        return '3º'
      default:
        return null;
    }
  };

  const medal = getRankMedal(ranking.posicao);
  const userName = ranking.users.name || 'User';
  const initialsFromName = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Link href={`/ranking/${ranking.users.username}`}>
      <div
        onClick={() => onClick?.(ranking)}
        className={`group relative w-full rounded-lg border dark:bg-gradient-to-r ${getRankMedalColor(ranking.posicao)} backdrop-blur-sm transition-all duration-300 cursor-pointer
          ${animated ? 'dark:hover:shadow-lg hover:scale-102' : ''}
          ${isUserRanking ? 'ring-2 ring-emerald-500/50 dark:ring-offset-slate-950 ring-offset-1' : ''}
          ${isTop3 ? 'border-2' : 'border'}`}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Position / Medal */}
          <div className={`flex h-12 w-12 items-center justify-center rounded-full dark:bg-slate-900/50 dark:text-white text-xl font-bold`}>
            {medal ? (
              <span className="text-2xl">{medal}</span>
            ) : (
              <span className={`${themeClasses.text.secondary}`}>#{ranking.posicao}</span>
            )}
          </div>

          {/* Avatar & User Info */}
          <div className="flex flex-1 items-center gap-3 min-w-0">
            <Avatar
              src={ranking.users.avatar_url ?? undefined}
              initials={initialsFromName}
              size="md"
            />

            <div className="min-w-0 flex-1">
              <p className={`font-semibold ${themeClasses.text.primary} truncate`}>
                {userName}
              </p>
              <p className={`text-xs ${themeClasses.text.secondary} truncate`}>
                @{ranking.users.username || 'user'}
              </p>
            </div>
          </div>

          {/* Economia Taxa */}
          <div className="flex flex-col items-end gap-1">
            <div className="text-right">
              <p className={`text-sm ${themeClasses.text.secondary}`}>Taxa</p>
              <p className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {formatEconomia(ranking.economia_taxa)}
              </p>
            </div>
          </div>
        </div>

        {/* Badges */}
        {ranking.badges && ranking.badges.length > 0 && (
          <div className={`border-t dark:border-slate-700/30 px-4 py-3`}>
            <BadgeGroup
              badges={ranking.badges as any}
              size="sm"
              showLabel={true}
              maxDisplay={4}
            />
          </div>
        )}

        {/* User ranking indicator */}
        {isUserRanking && (
          <div className="absolute -right-2 -top-2 rounded-full bg-emerald-500 px-2 py-1 text-xs font-semibold text-white shadow-lg">
            Você
          </div>
        )}
      </div>
    </Link>
  );
}
