/**
 * Arquivo de otimizações e configurações de performance para o ranking
 * Inclui: lazy loading, code splitting, cache strategies
 */

// Configurações de Next.js para cache de dados
export const revalidate = 3600; // Revalidar dados a cada 1 hora

// Estratégia de cache para API routes
export const cacheConfig = {
  // Cache de rankings: 5 minutos
  rankings: 5 * 60,
  // Cache de usuário: 30 minutos
  user: 30 * 60,
  // Cache de histórico: 1 hora
  history: 60 * 60,
} as const;

/**
 * Função para criar headers de cache HTTP
 */
export function getCacheHeaders(cacheTime: number) {
  return {
    'Cache-Control': `public, s-maxage=${cacheTime}, stale-while-revalidate=86400`,
    'CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
  };
}

/**
 * Configurações de prefetch para o Ranking
 */
export const prefetchConfig = {
  // Prefetch automático de rankings ao entrar na página
  prefetchRankings: true,
  // Prefetch de perfil ao hover em um usuário
  prefetchProfile: true,
  // Intervalo de revalidação (em ms)
  revalidationInterval: 60000, // 1 minuto
} as const;

/**
 * Função para gerar sitemap dinâmico para rankings
 * Útil para SEO
 */
export async function generateRankingSitemap() {
  return [
    {
      url: 'https://poupen.com/ranking',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    // Adicionar URLs de usuários principais aqui
  ];
}

/**
 * Metadata dinâmica para páginas de ranking
 */
export function generateRankingMetadata(month: string) {
  return {
    title: `Ranking Poupen - ${month}`,
    description: 'Compete com outras poupadoras e ganhe badges exclusivos no Poupen Ranking',
    openGraph: {
      title: `Ranking Poupen - ${month}`,
      description: 'Compete com outras poupadoras e ganhe badges exclusivos',
      images: [
        {
          url: '/og-ranking.png',
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export function generateUserMetadata(username: string, name: string) {
  return {
    title: `${name} no Poupen Ranking`,
    description: `Veja a posição e histórico de ${name} no ranking mensal de economia do Poupen`,
    openGraph: {
      title: `${name} no Poupen Ranking`,
      description: `Posição no ranking mensal de economia do Poupen`,
    },
  };
}
