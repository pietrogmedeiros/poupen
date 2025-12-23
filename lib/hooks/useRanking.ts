'use client';

import { useState, useEffect, useCallback } from 'react';
import { RankingWithUser } from '@/lib/types/ranking';

interface UseRankingOptions {
  month?: string; // YYYY-MM format
  limit?: number;
  offset?: number;
  username?: string;
  realtime?: boolean;
}

interface UseRankingReturn {
  rankings: RankingWithUser[];
  userRanking: RankingWithUser | null;
  total: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useRanking(options: UseRankingOptions = {}): UseRankingReturn {
  const {
    month,
    limit = 50,
    offset: initialOffset = 0,
    username,
    realtime = false,
  } = options;

  const [rankings, setRankings] = useState<RankingWithUser[]>([]);
  const [userRanking, setUserRanking] = useState<RankingWithUser | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(initialOffset);

  const fetchRankings = useCallback(async (currentOffset = 0) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (month) params.append('month', month);
      params.append('limit', limit.toString());
      params.append('offset', currentOffset.toString());
      if (username) params.append('username', username);

      const response = await fetch(`/api/ranking?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch rankings: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (currentOffset === 0) {
        setRankings(data.rankings || []);
      } else {
        setRankings((prev) => [...prev, ...(data.rankings || [])]);
      }

      setTotal(data.total || 0);
      setUserRanking(data.userRanking || null);
      setOffset(currentOffset + limit);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar ranking';
      setError(message);
      console.error('useRanking fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [month, limit, username]);

  // Fetch inicial
  useEffect(() => {
    fetchRankings(0);
  }, [month, limit, username, fetchRankings]);

  // Setup realtime subscription (opcional)
  useEffect(() => {
    if (!realtime) return;

    // TODO: Implementar Supabase realtime subscription quando necessário
    // const channel = supabase
    //   .channel(`rankings:${month || 'current'}`)
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'rankings',
    //     },
    //     (payload) => {
    //       // Refetch ou update local state
    //       refetch();
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(channel);
    // };
  }, [realtime, month]);

  const fetchMore = useCallback(async () => {
    await fetchRankings(offset);
  }, [offset, fetchRankings]);

  const refetch = useCallback(async () => {
    await fetchRankings(0);
  }, [fetchRankings]);

  return {
    rankings,
    userRanking,
    total,
    loading,
    error,
    hasMore: rankings.length < total,
    fetchMore,
    refetch,
  };
}
