// ============================================================
// RANKING TYPES - Sistema de Ranking Mensal
// ============================================================

export type BadgeType = 
  | 'top_1'           // 🥇 #1 do mês
  | 'top_10'          // 🏆 Top 10
  | 'top_25'          // ⭐ Top 25
  | 'streak_3'        // 🔥 3 meses seguidos economizando
  | 'high_growth'     // 📈 +20% de economia vs mês anterior
  | 'consistency'     // ✨ Semana sem ultrapassar limite
  | 'first_month';    // 🎯 Primeiro mês completado

export interface Badge {
  id: BadgeType;
  label: string;
  icon: string;
  color: string;
  description: string;
  requirement?: string;
}

export interface RankingData {
  id: string;
  user_id: string;
  month: string; // Format: "YYYY-MM" ex: "2025-12"
  economia_taxa: number; // 0-100%
  entradas_total: number;
  despesas_total: number;
  posicao: number; // Rank position (1, 2, 3...)
  badges: string[]; // Array de badge IDs
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  username: string;
  total_badges: number;
  current_streak: number;
  bio?: string | null;
}

export interface RankingWithUser extends RankingData {
  users: UserPublic;
}

export interface RankingHistory {
  id: string;
  user_id: string;
  month: string; // Format: "YYYY-MM"
  day: number; // Day of month (1-31)
  posicao: number;
  economia_taxa: number;
  created_at: string;
}

export interface RankingResponse {
  rankings: RankingWithUser[];
  total: number;
  userRanking: RankingData | null;
  month: string;
}

export interface RankingCalculateResponse {
  success: boolean;
  month: string;
  usersProcessed: number;
  timestamp: string;
}

// Badge metadata
export const BADGES: Record<BadgeType, Badge> = {
  top_1: {
    id: 'top_1',
    label: 'Campeão',
    icon: '🥇',
    color: '#FFD700',
    description: 'Você é o #1 em economia este mês!',
    requirement: 'Ser o primeiro lugar no ranking'
  },
  top_10: {
    id: 'top_10',
    label: 'Elite',
    icon: '🏆',
    color: '#C0C0C0',
    description: 'Você está no top 10!',
    requirement: 'Estar entre os 10 primeiros'
  },
  top_25: {
    id: 'top_25',
    label: 'Destaque',
    icon: '⭐',
    color: '#FF6B6B',
    description: 'Você está no top 25!',
    requirement: 'Estar entre os 25 primeiros'
  },
  streak_3: {
    id: 'streak_3',
    label: 'Persistência',
    icon: '🔥',
    color: '#FF8C00',
    description: 'Você tem 3 meses de economia seguida!',
    requirement: '3 meses com economia positiva'
  },
  high_growth: {
    id: 'high_growth',
    label: 'Crescimento',
    icon: '📈',
    color: '#51CF66',
    description: 'Você cresceu +20% em economia!',
    requirement: 'Economizar 20% a mais que mês anterior'
  },
  consistency: {
    id: 'consistency',
    label: 'Consistência',
    icon: '✨',
    color: '#4DABF7',
    description: 'Você foi consistente a semana toda!',
    requirement: 'Manter despesas dentro do limite por 7 dias'
  },
  first_month: {
    id: 'first_month',
    label: 'Iniciante',
    icon: '🎯',
    color: '#B197FC',
    description: 'Seu primeiro mês no ranking!',
    requirement: 'Completar primeiro mês'
  }
};
