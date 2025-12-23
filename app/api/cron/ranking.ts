import { NextRequest, NextResponse } from 'next/server';

/**
 * CRON Job - Calcula rankings mensais diariamente (00:00)
 * Agendado via vercel.json
 * 
 * Exemplo de configuração em vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/ranking",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Validar Vercel CRON token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || token !== cronSecret) {
      return NextResponse.json(
        { error: 'Invalid CRON secret' },
        { status: 403 }
      );
    }

    console.log('[CRON] Iniciando job de ranking');

    // Chamar a API de cálculo
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/ranking/calculate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[CRON] Erro na execução:', error);
      return NextResponse.json(
        { error: 'Failed to execute ranking calculation' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[CRON] Job concluído com sucesso:', data);

    return NextResponse.json({
      success: true,
      message: 'Ranking calculation completed',
      data
    });
  } catch (error) {
    console.error('[CRON] Erro não tratado:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
