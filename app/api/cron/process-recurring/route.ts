import { processRecurringTransactions, createReminderNotifications } from '@/lib/supabase-queries';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint para processar transações recorrentes
 * Pode ser chamado por um cron job externo ou manualmente
 * 
 * Uso: POST /api/cron/process-recurring
 */
export async function POST(request: NextRequest) {
  try {
    // Validar token de segurança (opcional, você pode adicionar um secret)
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;
    
    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Processar transações recorrentes
    const result1 = await processRecurringTransactions();
    if (!result1.success) {
      throw new Error('Erro ao processar transações recorrentes');
    }

    // Criar notificações de lembrete (5 dias antes)
    const result2 = await createReminderNotifications();
    if (!result2.success) {
      console.warn('Aviso ao criar lembretes:', result2.error);
    }

    return NextResponse.json({
      success: true,
      message: 'Transações recorrentes processadas com sucesso',
      processedTransactions: result1.data?.length || 0,
      reminders: result2.data?.length || 0,
    });
  } catch (error) {
    console.error('Erro ao processar recorrências:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao processar transações recorrentes',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
