// ============================================================
// RANKING UTILITIES - Funções de cálculo e processamento
// ============================================================

import { BadgeType, RankingData } from '@/lib/types/ranking';

/**
 * Calcula a taxa de economia entre Entradas e Despesas
 * Fórmula: ((Entradas - Despesas) / Entradas) × 100
 *
 * @param entradas Total de entradas (receitas)
 * @param despesas Total de despesas
 * @returns Taxa de economia entre 0-100%
 */
export function calcularEconomia(entradas: number, despesas: number): number {
  if (entradas === 0) return 0;
  
  const taxa = ((entradas - despesas) / entradas) * 100;
  
  // Clampear entre 0-100
  return Math.max(0, Math.min(100, Math.round(taxa * 100) / 100));
}

/**
 * Retorna o mês atual no formato YYYY-MM
 * @returns String no formato "2025-12"
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Retorna o mês anterior no formato YYYY-MM
 * @param month Mês de referência (ex: "2025-12")
 * @returns String no formato "2025-11"
 */
export function getPreviousMonth(month: string): string {
  const [year, monthStr] = month.split('-');
  let m = parseInt(monthStr) - 1;
  let y = parseInt(year);
  
  if (m === 0) {
    m = 12;
    y--;
  }
  
  return `${y}-${String(m).padStart(2, '0')}`;
}

/**
 * Retorna o próximo mês no formato YYYY-MM
 * @param month Mês de referência (ex: "2025-12")
 * @returns String no formato "2026-01"
 */
export function getNextMonth(month: string): string {
  const [year, monthStr] = month.split('-');
  let m = parseInt(monthStr) + 1;
  let y = parseInt(year);
  
  if (m === 13) {
    m = 1;
    y++;
  }
  
  return `${y}-${String(m).padStart(2, '0')}`;
}

/**
 * Formata a taxa de economia para exibição (PT-BR)
 * @param taxa Taxa em formato numérico (ex: 75.5)
 * @returns String formatada (ex: "75,5%")
 */
export function formatEconomia(taxa: number): string {
  return taxa.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }) + '%';
}

/**
 * Formata moeda em padrão brasileiro
 * @param valor Valor numérico
 * @returns String formatada (ex: "R$ 1.234,56")
 */
export function formatMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/**
 * Avalia e retorna badges que o usuário conquistou
 *
 * @param posicao Posição atual no ranking
 * @param economia_taxa Taxa de economia atual
 * @param rankingAnterior Ranking do mês anterior (para calcular streak e growth)
 * @param firstMonth Se é o primeiro mês do usuário
 * @param currentStreak Streak atual do usuário
 * @returns Array de badge IDs conquistados
 */
export function avaliarBadges(
  posicao: number,
  economia_taxa: number,
  rankingAnterior?: RankingData,
  firstMonth: boolean = false,
  currentStreak: number = 0
): BadgeType[] {
  const badges: BadgeType[] = [];

  // Badge: Primeiro mês
  if (firstMonth) {
    badges.push('first_month');
  }

  // Badge: Top 1
  if (posicao === 1) {
    badges.push('top_1');
  }

  // Badge: Top 10
  if (posicao <= 10) {
    badges.push('top_10');
  }

  // Badge: Top 25
  if (posicao <= 25) {
    badges.push('top_25');
  }

  // Badge: Streak 3 (3 meses seguidos economizando)
  if (currentStreak >= 3) {
    badges.push('streak_3');
  }

  // Badge: High Growth (+20% vs mês anterior)
  if (rankingAnterior && economia_taxa >= rankingAnterior.economia_taxa + 20) {
    badges.push('high_growth');
  }

  // Badge: Consistency (será calculado separadamente com análise de semanas)
  // Por enquanto, deixaremos placeholder - implementar lógica de análise de semana

  return badges;
}

/**
 * Converte string de badges para array tipado
 * @param badges Array de strings ou undefined
 * @returns Array de BadgeType
 */
export function parseBadges(badges?: string[] | null): BadgeType[] {
  if (!badges || !Array.isArray(badges)) return [];
  return badges.filter((b): b is BadgeType => 
    ['top_1', 'top_10', 'top_25', 'streak_3', 'high_growth', 'consistency', 'first_month'].includes(b)
  );
}

/**
 * Calcula a diferença de economia entre dois rankings
 * @param atual Taxa atual
 * @param anterior Taxa anterior
 * @returns Diferença percentual (ex: +5.2 ou -3.1)
 */
export function calcularDiferencaEconomia(atual: number, anterior?: number): number {
  if (!anterior) return 0;
  return Math.round((atual - anterior) * 100) / 100;
}

/**
 * Retorna a cor do gradient baseado na taxa de economia
 * De vermelho (0%) para verde (100%)
 *
 * @param taxa Taxa de economia (0-100)
 * @returns Classe Tailwind ou hex color
 */
export function getEconomiaGradientColor(taxa: number): string {
  if (taxa < 25) return 'from-red-500 to-orange-500'; // Baixo
  if (taxa < 50) return 'from-orange-500 to-yellow-500'; // Médio-baixo
  if (taxa < 75) return 'from-yellow-500 to-lime-500'; // Médio
  return 'from-lime-500 to-green-500'; // Alto
}

/**
 * Calcula quantos dias faltam para o fim do mês
 * @param month Mês (formato "YYYY-MM")
 * @returns Número de dias faltando
 */
export function diasFaltandoParaFimMes(month?: string): number {
  const data = month ? new Date(month + '-01') : new Date();
  const proximoMes = new Date(data.getFullYear(), data.getMonth() + 1, 1);
  const hoje = new Date();
  const diff = Math.floor((proximoMes.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

/**
 * Valida se uma data está no formato YYYY-MM
 * @param month String para validar
 * @returns boolean
 */
export function isValidMonth(month: string): boolean {
  const regex = /^\d{4}-\d{2}$/;
  if (!regex.test(month)) return false;
  
  const [year, monthStr] = month.split('-');
  const y = parseInt(year);
  const m = parseInt(monthStr);
  
  return y > 1900 && y < 2100 && m >= 1 && m <= 12;
}

/**
 * Retorna label legível do mês
 * @param month Formato "YYYY-MM"
 * @returns String legível (ex: "Dezembro 2025")
 */
export function getMonthLabel(month: string): string {
  const [year, monthStr] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthStr) - 1, 1);
  
  return date.toLocaleString('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).charAt(0).toUpperCase() + date.toLocaleString('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).slice(1);
}

/**
 * Retorna intervalo de valores que faltam para próxima posição
 * @param rankingAtual Taxa atual
 * @param rankingProximo Taxa da próxima posição
 * @returns Diferença em percentual
 */
export function faltaParaProxima(rankingAtual: number, rankingProximo?: number): number {
  if (!rankingProximo || rankingProximo <= rankingAtual) return 0;
  return Math.round((rankingProximo - rankingAtual) * 100) / 100;
}
