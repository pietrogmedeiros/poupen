import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { fetchUserByUsername, fetchRankings } from '@/lib/ranking-queries';
import { getCurrentMonth } from '@/lib/ranking';
import { RankingListItem } from '@/components/ranking/RankingListItem';
import { BadgeGroup } from '@/components/ranking/BadgeDisplay';
import { StreakDisplay, StreakGrid } from '@/components/ranking/StreakDisplay';
import { Avatar } from '@/components/ui/avatar';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

/**
 * Página de Perfil do Usuário - Exibe histórico de ranking e badges
 * Validação rigorosa com server-side rendering
 */
export default async function UserRankingPage({ params }: PageProps) {
  try {
    const { username } = await params;

    // Validar username - security check
    if (!username || typeof username !== 'string' || username.length > 50) {
      notFound();
    }

    const sanitizedUsername = username.toLowerCase().trim();

    // Buscar usuário
    const userDataRaw = await fetchUserByUsername(sanitizedUsername);

    if (!userDataRaw) {
      notFound();
    }

    const userData = userDataRaw as any;

    const month = getCurrentMonth();

    // Buscar ranking atual do usuário
    let userRanking = null;
    let monthlyHistory = [];

    try {
      const rankingsResponse = await fetchRankings(month, 100, 0);
      const rankings = rankingsResponse || [];

      // Encontrar ranking do usuário no mês atual
      userRanking = rankings.find((r) => r.user_id === userData.id);

      // TODO: Implementar busca de histórico mensal quando tiver dados históricos
      // monthlyHistory = await fetchUserRankingHistory(userData.id, 12);
    } catch (error) {
      console.error('Erro ao buscar ranking do usuário:', error);
    }

    const initials = userData.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
        {/* Container Principal */}
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Botão Voltar */}
          <Link
            href="/ranking"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
          >
            ← Voltar ao Ranking
          </Link>

          {/* Header com Info do Usuário */}
          <div className="rounded-lg border border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <Avatar
                src={userData.avatar_url ?? undefined}
                initials={initials}
                size="xl"
              />

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-white">{userData.name}</h1>
                <p className="text-lg text-slate-400">@{userData.username}</p>

                {userData.bio && (
                  <p className="mt-3 text-slate-300 italic">{userData.bio}</p>
                )}

                {/* Stats Grid */}
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Badges</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {userData.total_badges}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Streak</p>
                    <p className="text-2xl font-bold text-red-400">
                      {userData.current_streak}🔥
                    </p>
                  </div>
                  {userRanking && (
                    <>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Posição</p>
                        <p className="text-2xl font-bold text-emerald-400">
                          #{userRanking.posicao}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Taxa</p>
                        <p className="text-2xl font-bold text-cyan-400">
                          {userRanking.economia_taxa.toFixed(1)}%
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ranking Atual */}
          {userRanking ? (
            <div>
              <h2 className="mb-4 text-2xl font-bold text-white">Posição Atual</h2>
              <RankingListItem ranking={userRanking} isUserRanking={false} />
            </div>
          ) : (
            <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-6 text-center">
              <p className="text-slate-400">
                Sem dados de ranking para o mês atual. Comece a adicionar transações!
              </p>
            </div>
          )}

          {/* Badges Section */}
          {userRanking?.badges && userRanking.badges.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-bold text-white">Badges Conquistados</h2>
              <div className="rounded-lg border border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm p-6">
                <BadgeGroup
                  badges={userRanking.badges as any}
                  size="lg"
                  showLabel={true}
                  maxDisplay={10}
                  className="justify-center gap-4"
                />
              </div>
            </div>
          )}

          {/* Streak Visualization */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <StreakDisplay
              streak={userData.current_streak}
              maxStreak={12}
            />
            <StreakGrid
              streak={userData.current_streak}
            />
          </div>

          {/* Histórico de Ranking (Placeholder) */}
          <div className="rounded-lg border border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm p-6">
            <h2 className="text-xl font-bold text-white mb-4">📈 Histórico de Ranking</h2>
            <p className="text-slate-400">
              Os históricos mensais estarão disponíveis em breve, quando tivermos dados de múltiplos períodos.
            </p>
          </div>

          {/* Bio Section */}
          {userData.bio && (
            <div className="rounded-lg border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm p-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Sobre {userData.name}</h3>
              <p className="text-slate-300">{userData.bio}</p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erro na página de perfil:', error);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 max-w-md text-center">
          <p className="text-red-400 font-semibold mb-2">❌ Erro ao Carregar Perfil</p>
          <p className="text-slate-400 text-sm mb-4">
            Houve um problema ao buscar os dados do usuário.
          </p>
          <Link
            href="/ranking"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
          >
            ← Voltar ao Ranking
          </Link>
        </div>
      </div>
    );
  }
}
