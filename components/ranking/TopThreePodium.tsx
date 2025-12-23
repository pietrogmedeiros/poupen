'use client';

import React from 'react';
import Link from 'next/link';
import { RankingWithUser } from '@/lib/types/ranking';
import { formatEconomia } from '@/lib/ranking';
import { BadgeGroup } from './BadgeDisplay';
import { Avatar } from '@/components/ui/avatar';
import { themeClasses } from '@/lib/theme-classes';

interface TopThreePodiumProps {
  rankings: RankingWithUser[];
  className?: string;
}

/**
 * TopThreePodium - Exibe os 3 primeiros colocados com animação de podium
 * Componente seguro com validação rigorosa de tipos
 */
export function TopThreePodium({
  rankings,
  className = '',
}: TopThreePodiumProps) {
  // Garantir que temos exatamente os 3 primeiros
  const topThree = rankings.filter((r) => r.posicao >= 1 && r.posicao <= 3);

  // Reordenar para 2 (prata), 1 (ouro), 3 (bronze) - layout visual
  const podiumOrder = [
    topThree.find((r) => r.posicao === 2),
    topThree.find((r) => r.posicao === 1),
    topThree.find((r) => r.posicao === 3),
  ].filter((r): r is RankingWithUser => r !== undefined);

  if (podiumOrder.length === 0) {
    return (
      <div
        className={`rounded-lg ${themeClasses.border.primary} dark:bg-gradient-to-r dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-sm px-6 py-8 text-center ${className}`}
      >
        <p className={`${themeClasses.text.secondary}`}>Ranking ainda não disponível</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg ${themeClasses.border.primary} dark:bg-gradient-to-r dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-sm p-6 ${className}`}
    >
      {/* Title */}
      <h3 className={`mb-8 text-center text-lg font-bold ${themeClasses.text.primary}`}>
        Top 3 do Mês
      </h3>

      {/* Podium Container */}
      <div className="flex items-flex-end justify-center gap-4">
        {podiumOrder.map((ranking, index) => {
          const position = ranking.posicao;
          const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉';
          const podiumHeight = position === 1 ? 'h-40' : position === 2 ? 'h-32' : 'h-24';
          const podiumBgStyle = position === 1
            ? {background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(202, 138, 4, 0.2))', borderColor: 'rgba(234, 179, 8, 0.5)'}
            : position === 2
              ? {background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.2), rgba(100, 116, 139, 0.2))', borderColor: 'rgba(148, 163, 184, 0.5)'}
              : {background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(217, 119, 6, 0.2))', borderColor: 'rgba(249, 115, 22, 0.5)'}

          const userName = ranking.users.name || 'User';
          const initialsFromName = userName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();

          return (
            <Link key={ranking.id} href={`/ranking/${ranking.users.username}`}>
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                {/* Rank Medal */}
                <div className="text-4xl animate-bounce" style={{animationDelay: `${index * 0.1}s`}}>
                  {medal}
                </div>

                {/* Podium */}
                <div
                  className={`relative w-20 rounded-t-lg border-2 transition-all duration-300 group-hover:shadow-lg ${podiumHeight}`}
                  style={{...podiumBgStyle}}
                >
                  {/* Position Number */}
                  <div className="absolute -top-6 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full text-lg font-bold" style={{background: 'var(--bg-primary)', borderColor: 'var(--border-primary)', border: '2px solid', color: 'var(--text-primary)'}}>
                    #{position}
                  </div>

                  {/* Inside Podium - User Avatar */}
                  <div className="flex flex-col items-center justify-center h-full gap-2 px-2 py-3">
                    <Avatar
                      src={ranking.users.avatar_url ?? undefined}
                      initials={initialsFromName}
                      size="sm"
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="w-full text-center">
                  <p className={`text-sm font-semibold ${themeClasses.text.primary} truncate max-w-[120px]`}>
                    {userName}
                  </p>
                  <p className={`text-xs ${themeClasses.text.secondary} truncate max-w-[120px]`}>
                    @{ranking.users.username || 'user'}
                  </p>
                </div>

                {/* Taxa */}
                <div className={`w-full rounded-lg dark:bg-slate-900/50 ${themeClasses.border.primary} px-2 py-1 text-center`}>
                  <p className={`text-xs ${themeClasses.text.secondary}`}>Taxa</p>
                  <p className="text-sm font-bold text-orange-500">
                    {formatEconomia(ranking.economia_taxa)}
                  </p>
                </div>

                {/* Badges */}
                {ranking.badges && ranking.badges.length > 0 && (
                  <div className="w-full">
                    <BadgeGroup
                      badges={ranking.badges as any}
                      size="sm"
                      showLabel={false}
                      maxDisplay={3}
                      className="justify-center"
                    />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
