// ============================================================
// RANKING QUERIES - Operações de banco de dados
// ============================================================

import { supabase } from '@/lib/supabase';
import { RankingData, RankingWithUser, RankingHistory } from '@/lib/types/ranking';

/**
 * Fetch rankings de um mês específico
 * @param month Formato "YYYY-MM"
 * @param limit Limite de resultados (default 50)
 * @param offset Offset para paginação (default 0)
 * @returns Array de rankings com dados de usuário
 */
export async function fetchRankings(
  month: string,
  limit: number = 50,
  offset: number = 0
): Promise<RankingWithUser[]> {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select(`
        *,
        users:user_id (id, name, email, avatar_url, username, total_badges, current_streak, bio)
      `)
      .eq('month', month)
      .order('posicao', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar rankings:', error);
    return [];
  }
}

/**
 * Fetch ranking de um usuário específico em um mês
 * @param userId ID do usuário
 * @param month Formato "YYYY-MM"
 * @returns RankingData ou null
 */
export async function fetchUserRanking(
  userId: string,
  month: string
): Promise<RankingData | null> {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Erro ao buscar ranking do usuário:', error);
    return null;
  }
}

/**
 * Fetch ranking com dados do usuário
 * @param userId ID do usuário
 * @param month Formato "YYYY-MM"
 * @returns RankingWithUser ou null
 */
export async function fetchUserRankingWithUser(
  userId: string,
  month: string
): Promise<RankingWithUser | null> {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select(`
        *,
        users:user_id (id, name, email, avatar_url, username, total_badges, current_streak, bio)
      `)
      .eq('user_id', userId)
      .eq('month', month)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Erro ao buscar ranking do usuário com dados:', error);
    return null;
  }
}

/**
 * Fetch total de usuários em um mês
 * @param month Formato "YYYY-MM"
 * @returns Número total
 */
export async function countRankingsInMonth(month: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('rankings')
      .select('*', { count: 'exact', head: true })
      .eq('month', month);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Erro ao contar rankings:', error);
    return 0;
  }
}

/**
 * Fetch histórico de posições de um usuário
 * @param userId ID do usuário
 * @param month Formato "YYYY-MM"
 * @returns Array de RankingHistory
 */
export async function fetchRankingHistory(
  userId: string,
  month: string
): Promise<RankingHistory[]> {
  try {
    const { data, error } = await supabase
      .from('ranking_history')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .order('day', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar histórico de ranking:', error);
    return [];
  }
}

/**
 * Fetch histórico de um usuário entre múltiplos meses
 * @param userId ID do usuário
 * @param months Array de meses (formato "YYYY-MM")
 * @returns Array de RankingHistory
 */
export async function fetchRankingHistoryMultipleMonths(
  userId: string,
  months: string[]
): Promise<RankingHistory[]> {
  try {
    const { data, error } = await supabase
      .from('ranking_history')
      .select('*')
      .eq('user_id', userId)
      .in('month', months)
      .order('month', { ascending: true })
      .order('day', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar histórico de ranking múltiplos meses:', error);
    return [];
  }
}

/**
 * Fetch ranking anterior de um usuário (para calcular growth)
 * @param userId ID do usuário
 * @param currentMonth Mês atual (para buscar mês anterior)
 * @returns RankingData ou null
 */
export async function fetchPreviousMonthRanking(
  userId: string,
  currentMonth: string
): Promise<RankingData | null> {
  try {
    const [year, month] = currentMonth.split('-');
    let prevMonth = parseInt(month) - 1;
    let prevYear = parseInt(year);

    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear--;
    }

    const previousMonth = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('user_id', userId)
      .eq('month', previousMonth)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Erro ao buscar ranking anterior:', error);
    return null;
  }
}

/**
 * Fetch top 3 do ranking
 * @param month Formato "YYYY-MM"
 * @returns Array de 3 RankingWithUser
 */
export async function fetchTopThreeRanking(
  month: string
): Promise<RankingWithUser[]> {
  try {
    const { data, error } = await supabase
      .from('rankings')
      .select(`
        *,
        users:user_id (id, name, email, avatar_url, username, total_badges, current_streak, bio)
      `)
      .eq('month', month)
      .order('posicao', { ascending: true })
      .limit(3);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar top 3 ranking:', error);
    return [];
  }
}

/**
 * Insere ou atualiza ranking de um usuário
 * @param ranking Dados de RankingData (sem id, created_at, updated_at)
 * @returns Objeto com sucesso/erro
 */
export async function upsertRanking(ranking: Omit<RankingData, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const rankingData: any = {
      ...ranking,
      updated_at: new Date().toISOString()
    };

    const result = await (supabase.from('rankings') as any).upsert([rankingData]).select();

    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Erro ao inserir/atualizar ranking:', error);
    return { success: false, error };
  }
}

/**
 * Insere histórico de ranking (snapshot diário)
 * @param history Dados de RankingHistory (sem id e created_at)
 * @returns Objeto com sucesso/erro
 */
export async function insertRankingHistory(
  history: Omit<RankingHistory, 'id' | 'created_at'>
) {
  try {
    const historyData: any = history;

    const result = await (supabase.from('ranking_history') as any).upsert([historyData]).select();

    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Erro ao inserir histórico de ranking:', error);
    return { success: false, error };
  }
}

/**
 * Atualiza streak e total_badges do usuário
 * @param userId ID do usuário
 * @param currentStreak Novo valor de streak
 * @param totalBadges Novo valor de total_badges
 * @returns Objeto com sucesso/erro
 */
export async function updateUserRankingStats(
  userId: string,
  currentStreak: number,
  totalBadges: number
) {
  try {
    const updateData: any = {
      current_streak: currentStreak,
      total_badges: totalBadges,
      updated_at: new Date().toISOString()
    };

    const result = await (supabase.from('users') as any).update(updateData).eq('id', userId).select();

    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Erro ao atualizar stats do usuário:', error);
    return { success: false, error };
  }
}

/**
 * Fetch perfil público de um usuário
 * @param userId ID do usuário
 * @returns User data ou null
 */
export async function fetchUserPublicProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, username, total_badges, current_streak, bio')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Erro ao buscar perfil público:', error);
    return null;
  }
}

/**
 * Fetch usuário por username
 * @param username Username do usuário
 * @returns User data ou null
 */
export async function fetchUserByUsername(username: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, username, total_badges, current_streak, bio')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Erro ao buscar usuário por username:', error);
    return null;
  }
}

/**
 * Verifica se username já existe
 * @param username Username para verificar
 * @returns boolean
 */
export async function usernameExists(username: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('username', username);

    if (error) throw error;
    return (count || 0) > 0;
  } catch (error) {
    console.error('Erro ao verificar username:', error);
    return false;
  }
}
