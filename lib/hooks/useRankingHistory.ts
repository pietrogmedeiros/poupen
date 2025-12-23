import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface RankingHistoryData {
  month: string;
  posicao: number;
  economia_taxa: number;
  created_at: string;
}

/**
 * Hook para buscar histórico de ranking do usuário
 * @param userId ID do usuário
 * @returns {history, loading, error}
 */
export function useRankingHistory(userId?: string) {
  const [history, setHistory] = useState<RankingHistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar rankings históricos do usuário
        // Primeiro tentamos buscar da tabela de rankings (todos os meses)
        const { data, error: queryError } = await supabase
          .from('rankings')
          .select('month, posicao, economia_taxa, created_at')
          .eq('user_id', userId)
          .order('month', { ascending: true });

        if (queryError) throw queryError;

        if (data) {
          // Transformar dados para o formato esperado
          const historyData = data.map((item: any) => ({
            month: item.month,
            posicao: item.posicao,
            economia_taxa: item.economia_taxa,
            created_at: item.created_at,
          }));

          setHistory(historyData);
        }
      } catch (err) {
        console.error('Erro ao buscar histórico de ranking:', err);
        setError('Erro ao carregar histórico');
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  return { history, loading, error };
}
