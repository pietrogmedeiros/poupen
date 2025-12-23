import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  calcularEconomia,
  avaliarBadges,
  getCurrentMonth,
  getPreviousMonth,
  isValidMonth
} from '@/lib/ranking';
import {
  fetchRankings,
  upsertRanking,
  insertRankingHistory,
  fetchPreviousMonthRanking,
  updateUserRankingStats
} from '@/lib/ranking-queries';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    // Validar CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Obter mês da query ou usar mês atual
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || getCurrentMonth();

    if (!isValidMonth(month)) {
      return NextResponse.json(
        { error: 'Invalid month format. Use YYYY-MM' },
        { status: 400 }
      );
    }

    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const monthNum = parseInt(monthStr);

    console.log(`[CRON] Iniciando cálculo de rankings para ${month}`);

    // Fetch todos users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('is_active', true);

    if (usersError) throw usersError;
    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        month,
        usersProcessed: 0,
        timestamp: new Date().toISOString()
      });
    }

    const previousMonth = getPreviousMonth(month);
    const today = new Date();
    const dayOfMonth = today.getDate();
    
    const rankingsData = [];

    // Processar cada usuário
    for (const user of users) {
      try {
        // Fetch transações do mês
        const { data: transactions, error: txError } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_id', user.id)
          .gte('date', `${month}-01`)
          .lte('date', `${month}-31`)
          .is('deleted_at', null);

        if (txError) throw txError;

        // Calcular entradas e despesas
        let entradas_total = 0;
        let despesas_total = 0;

        (transactions || []).forEach(tx => {
          if (tx.type === 'income') {
            entradas_total += parseFloat(tx.amount);
          } else if (tx.type === 'expense') {
            despesas_total += parseFloat(tx.amount);
          }
        });

        // Calcular taxa de economia
        const economia_taxa = calcularEconomia(entradas_total, despesas_total);

        rankingsData.push({
          user_id: user.id,
          month,
          economia_taxa,
          entradas_total,
          despesas_total
        });
      } catch (error) {
        console.error(`Erro ao processar usuário ${user.id}:`, error);
      }
    }

    // Ordenar por economia_taxa descendente e atribuir posições
    rankingsData.sort((a, b) => b.economia_taxa - a.economia_taxa);

    const now = new Date().toISOString();
    const usersUpdated = [];

    // Atualizar rankings e calcular badges
    for (let i = 0; i < rankingsData.length; i++) {
      const ranking = rankingsData[i];
      const posicao = i + 1;

      try {
        // Fetch ranking anterior para calcular growth e streak
        const previousRanking = await fetchPreviousMonthRanking(ranking.user_id, month);
        
        // Calcular se é primeiro mês
        const firstMonth = !previousRanking;

        // Calcular streak (vai ser incrementado se economia_taxa > 0)
        let currentStreak = 0;
        if (previousRanking) {
          const previousStreakResult = await supabase
            .from('users')
            .select('current_streak')
            .eq('id', ranking.user_id)
            .single();
          
          currentStreak = previousStreakResult.data?.current_streak || 0;
          if (ranking.economia_taxa > 0) {
            currentStreak += 1;
          } else {
            currentStreak = 0; // Reset se não economizou
          }
        } else if (ranking.economia_taxa > 0) {
          currentStreak = 1;
        }

        // Avaliar badges
        const badges = avaliarBadges(
          posicao,
          ranking.economia_taxa,
          previousRanking || undefined,
          firstMonth,
          currentStreak
        );

        // Upsert ranking
        const rankingToInsert = {
          user_id: ranking.user_id,
          month,
          economia_taxa: ranking.economia_taxa,
          entradas_total: ranking.entradas_total,
          despesas_total: ranking.despesas_total,
          posicao,
          badges: badges as any
        };

        await upsertRanking(rankingToInsert as any);

        // Inserir histórico (snapshot do dia)
        await insertRankingHistory({
          user_id: ranking.user_id,
          month,
          day: dayOfMonth,
          posicao,
          economia_taxa: ranking.economia_taxa
        });

        // Atualizar stats do usuário
        const uniqueBadges = new Set([...badges]);
        await updateUserRankingStats(
          ranking.user_id,
          currentStreak,
          uniqueBadges.size
        );

        usersUpdated.push({
          user_id: ranking.user_id,
          posicao,
          economia_taxa: ranking.economia_taxa,
          badges: badges.length
        });
      } catch (error) {
        console.error(`Erro ao atualizar ranking do usuário ${ranking.user_id}:`, error);
      }
    }

    console.log(`[CRON] Cálculo concluído. ${usersUpdated.length} usuários processados`);

    return NextResponse.json({
      success: true,
      month,
      usersProcessed: usersUpdated.length,
      timestamp: now,
      data: usersUpdated.slice(0, 10) // Retornar top 10 para debug
    });
  } catch (error) {
    console.error('Erro na API de cálculo de ranking:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
