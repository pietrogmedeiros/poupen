/**
 * Formata um número como moeda brasileira
 * @param value Valor numérico
 * @returns String formatada como R$ 1.234,56
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata apenas o número com separador de milhares e decimal
 * @param value Valor numérico
 * @returns String formatada como 1.234,56
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
