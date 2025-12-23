import React from 'react';
import { TopThreePodium } from '@/components/ranking/TopThreePodium';
import { YourRankCard } from '@/components/ranking/YourRankCard';
import { RankingLeaderboard } from '@/components/ranking/RankingLeaderboard';
import { StreakDisplay, StreakGrid } from '@/components/ranking/StreakDisplay';
import { getCurrentMonth } from '@/lib/ranking';
import { BADGES } from '@/lib/types/ranking';
import { fetchRankings, fetchUserRanking } from '@/lib/ranking-queries';
import { supabase } from '@/lib/supabase';

/**
 * Página Principal do Ranking - Exibe leaderboard mensal
 * Validação segura com server-side data fetching
 */
export default async function RankingPage() {
  try {
    // Obter usuário atual
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const month = getCurrentMonth();

    // Fetch rankings do mês
    let rankings: any[] = [];
    let userRanking: any = null;
    let userRankingData: any = null;

    try {
      const rankingsResponse = await fetchRankings(month, 100, 0);
      rankings = rankingsResponse || [];

      // Se usuário autenticado, obter sua posição
      if (user?.id) {
        const userRankResponse = await fetchUserRanking(user.id, month);
        userRankingData = userRankResponse;
      }
    } catch (error) {
      console.error('Erro ao buscar rankings:', error);
      // Continuar com valores vazios
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
        {/* Container Principal */}
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              🏆 Poupen Ranking
            </h1>
            <p className="text-slate-300">Compete com outras poupadoras e ganhe badges exclusivos!</p>
          </div>

          {/* Top 3 Podium */}
          {rankings.length > 0 && (
            <div>
              <TopThreePodium rankings={rankings} />
            </div>
          )}

          {/* Sua Posição */}
          {user?.id && (
            <div>
              <YourRankCard
                ranking={userRankingData}
                loading={false}
              />
            </div>
          )}

          {/* Stats Badges */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm p-4">
              <p className="text-xs text-slate-400 mb-2">Total de Usuários</p>
              <p className="text-3xl font-bold text-slate-300">{rankings.length}</p>
            </div>

            <div className="rounded-lg border border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm p-4">
              <p className="text-xs text-slate-400 mb-2">Badges Disponíveis</p>
              <p className="text-3xl font-bold text-slate-300">{Object.keys(BADGES).length}</p>
            </div>

            <div className="rounded-lg border border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm p-4">
              <p className="text-xs text-slate-400 mb-2">Melhor Taxa</p>
              <p className="text-3xl font-bold text-emerald-400">
                {rankings.length > 0 ? `${Math.max(...rankings.map(r => r.economia_taxa)).toFixed(1)}%` : '—'}
              </p>
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <RankingLeaderboard
              month={month}
              limit={50}
              showUserRanking={false}
            />
          </div>

          {/* Streak Info */}
          {user?.id && userRankingData?.users && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <StreakDisplay
                streak={userRankingData.users.current_streak}
                maxStreak={12}
              />
              <StreakGrid
                streak={userRankingData.users.current_streak}
              />
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-lg border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">ℹ️ Como Funciona?</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm text-slate-300">
              <div>
                <p className="font-semibold text-cyan-300 mb-1">📊 Taxa de Economia</p>
                <p className="text-slate-400">Calculada como (Entradas - Despesas) / Entradas × 100</p>
              </div>
              <div>
                <p className="font-semibold text-cyan-300 mb-1">🏆 Ranking Mensal</p>
                <p className="text-slate-400">Atualizado diariamente às 00:00 UTC com base nas suas transações</p>
              </div>
              <div>
                <p className="font-semibold text-cyan-300 mb-1">🔥 Streak</p>
                <p className="text-slate-400">Economize por múltiplos meses consecutivos para manter seu streak</p>
              </div>
              <div>
                <p className="font-semibold text-cyan-300 mb-1">🎖️ Badges</p>
                <p className="text-slate-400">Ganhe badges especiais por atingir marcos e metas específicas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erro na página de ranking:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 max-w-md text-center">
          <p className="text-red-400 font-semibold mb-2">❌ Erro ao Carregar Ranking</p>
          <p className="text-slate-400 text-sm">
            Houve um problema ao buscar os dados do ranking. Tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }
}
