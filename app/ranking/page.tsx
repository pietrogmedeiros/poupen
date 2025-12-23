import React from 'react';
import { TopThreePodium } from '@/components/ranking/TopThreePodium';
import { YourRankCard } from '@/components/ranking/YourRankCard';
import { RankProgressCard } from '@/components/ranking/RankProgressCard';
import { HeadToHeadCard } from '@/components/ranking/HeadToHeadCard';
import { RankingLeaderboard } from '@/components/ranking/RankingLeaderboard';
import { getCurrentMonth } from '@/lib/ranking';
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
        <div className="mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-3">Ranking</h1>
            <p className="text-slate-400 text-lg">Acompanhe sua posição e taxa de economia mensal</p>
          </div>

          {/* Top 3 Podium */}
          {rankings.length > 0 && (
            <div className="mb-12">
              <TopThreePodium rankings={rankings} />
            </div>
          )}

          {/* Your Position */}
          {user?.id && userRankingData ? (
            <>
              <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <YourRankCard
                    ranking={userRankingData}
                    loading={false}
                  />
                </div>
                <div>
                  <RankProgressCard
                    userRanking={userRankingData}
                    allRankings={rankings}
                  />
                </div>
              </div>

              {/* Head to Head */}
              <div className="mb-12">
                <HeadToHeadCard
                  userRanking={userRankingData}
                  allRankings={rankings}
                />
              </div>
            </>
          ) : user?.id && !userRankingData ? (
            // Usuário autenticado mas sem dados de ranking
            <div className="mb-12 rounded-lg border border-blue-500/50 bg-blue-500/10 p-6 text-center">
              <p className="text-blue-300 text-lg">
                📊 Seus dados de ranking aparecerão aqui após o próximo cálculo automático!
              </p>
              <p className="text-blue-200/70 text-sm mt-2">
                O ranking é atualizado diariamente. Enquanto isso, veja a posição de outros usuários abaixo.
              </p>
            </div>
          ) : null}

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
              <p className="text-sm font-medium text-slate-400 mb-2">Total de Usuários</p>
              <p className="text-3xl font-bold text-white">{rankings.length}</p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
              <p className="text-sm font-medium text-slate-400 mb-2">Sua Posição</p>
              <p className="text-3xl font-bold text-white">
                {userRankingData?.posicao ? `#${userRankingData.posicao}` : '—'}
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
              <p className="text-sm font-medium text-slate-400 mb-2">Melhor Taxa</p>
              <p className="text-3xl font-bold text-orange-500">
                {rankings.length > 0 ? `${Math.max(...rankings.map(r => r.economia_taxa)).toFixed(1)}%` : '—'}
              </p>
            </div>
          </div>

          {/* Leaderboard Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Leaderboard do Mês</h2>
            <RankingLeaderboard
              month={month}
              limit={50}
              showUserRanking={false}
            />
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
