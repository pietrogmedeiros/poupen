'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useRanking } from '@/lib/hooks/useRanking';
import { RankingListItem } from './RankingListItem';
import { RankingWithUser } from '@/lib/types/ranking';
import { Skeleton } from '@/components/ui/skeleton';

interface RankingLeaderboardProps {
  month?: string;
  limit?: number;
  showUserRanking?: boolean;
  onRankingClick?: (ranking: RankingWithUser) => void;
  className?: string;
}

export function RankingLeaderboard({
  month,
  limit = 50,
  showUserRanking = true,
  onRankingClick,
  className = '',
}: RankingLeaderboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { rankings, userRanking, loading, error, hasMore, fetchMore } =
    useRanking({
      month,
      limit,
      realtime: false,
    });

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 500;

    if (isNearBottom && hasMore && !loading) {
      fetchMore();
    }
  }, [hasMore, loading, fetchMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 rounded-lg border border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm px-4 py-3">
        <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          📊 Poupen Ranking
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Compete com outros poupadoras e ganhe badges exclusivos!
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          ❌ {error}
        </div>
      )}

      {/* User Ranking Card (if available) */}
      {showUserRanking && userRanking && (
        <div className="rounded-lg border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-4">
          <p className="text-xs text-emerald-400 font-semibold mb-3 uppercase tracking-wider">
            Sua Posição no Ranking
          </p>
          <RankingListItem
            ranking={userRanking}
            isUserRanking={true}
            onClick={onRankingClick}
          />
        </div>
      )}

      {/* Leaderboard Container */}
      <div
        ref={containerRef}
        className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
      >
        {loading && rankings.length === 0 ? (
          // Loading Skeleton
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-20 rounded-lg bg-slate-800/50"
              />
            ))}
          </>
        ) : rankings.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <p className="text-3xl">🏆</p>
            <p className="text-slate-400">Nenhum ranking disponível</p>
            <p className="text-xs text-slate-500">
              Os rankings estarão disponíveis após o próximo cálculo
            </p>
          </div>
        ) : (
          // Rankings List
          rankings.map((ranking, index) => (
            <RankingListItem
              key={`${ranking.id}-${index}`}
              ranking={ranking}
              isTop3={ranking.posicao <= 3}
              onClick={onRankingClick}
            />
          ))
        )}

        {/* Loading More */}
        {loading && rankings.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-slate-600 animate-bounce" />
              <div className="h-2 w-2 rounded-full bg-slate-600 animate-bounce delay-100" />
              <div className="h-2 w-2 rounded-full bg-slate-600 animate-bounce delay-200" />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {rankings.length > 0 && (
        <div className="text-center text-xs text-slate-500">
          Exibindo {rankings.length} de {rankings.length + (hasMore ? '+' : '')}{' '}
          rankings
        </div>
      )}
    </div>
  );
}
