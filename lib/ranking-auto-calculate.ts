/**
 * Serviço de Auto-cálculo de Rankings
 * Dispara o cálculo automático quando transações são criadas/atualizadas
 */

/**
 * Chamar esta função após criar/atualizar uma transação
 * Faz uma chamada assíncrona ao endpoint de cálculo sem bloquear o fluxo
 */
export async function triggerRankingRecalculation() {
  try {
    // Fire and forget - não bloqueamos o usuário esperando o resultado
    fetch('/api/ranking/calculate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'placeholder_cron_secret'}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          console.warn(`Ranking recalculation returned status ${res.status}`);
        }
      })
      .catch((err) => {
        console.warn('Ranking recalculation failed silently:', err.message);
        // Não lançar erro - isso é secundário
      });
  } catch (error) {
    console.warn('Failed to trigger ranking recalculation:', error);
  }
}

/**
 * Hook para usar em componentes que criam transações
 * Chama o recalculation após sucesso
 */
export function useRankingRecalculation() {
  const recalculate = async () => {
    triggerRankingRecalculation();
  };

  return { recalculate };
}
