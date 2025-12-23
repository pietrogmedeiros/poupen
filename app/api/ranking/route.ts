import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidMonth, getCurrentMonth } from '@/lib/ranking';
import { fetchRankings, fetchUserRanking, countRankingsInMonth, fetchUserByUsername } from '@/lib/ranking-queries';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros da query
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || getCurrentMonth();
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const username = searchParams.get('username');

    // Validar mês
    if (!isValidMonth(month)) {
      return NextResponse.json(
        { error: 'Invalid month format. Use YYYY-MM' },
        { status: 400 }
      );
    }

    // Fetch rankings
    const rankings = await fetchRankings(month, limit, offset);

    // Fetch total de usuários
    const total = await countRankingsInMonth(month);

    // Fetch ranking do usuário atual (se autenticado)
    let userRanking = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (!authError && user) {
          userRanking = await fetchUserRanking(user.id, month);
        }
      } catch {
        // Ignorar erro de autenticação
      }
    }

    // Se username foi fornecido, buscar ranking daquele usuário
    let searchedUserRanking = null;
    if (username) {
      const user = await fetchUserByUsername(username) as any;
      if (user?.id) {
        searchedUserRanking = await fetchUserRanking(user.id, month);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          rankings,
          total,
          userRanking,
          searchedUserRanking,
          month,
          pagination: {
            limit,
            offset,
            pages: Math.ceil(total / limit)
          }
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro na API de ranking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
