'use client';

import React, { Suspense, lazy } from 'react';

/**
 * Lazy-loaded components para ranking
 * Reduz o tamanho do bundle inicial
 */

// Componentes com lazy loading
export const LazyTopThreePodium = lazy(() =>
  import('@/components/ranking/TopThreePodium').then((mod) => ({
    default: mod.TopThreePodium,
  }))
);

export const LazyYourRankCard = lazy(() =>
  import('@/components/ranking/YourRankCard').then((mod) => ({
    default: mod.YourRankCard,
  }))
);

export const LazyRankingLeaderboard = lazy(() =>
  import('@/components/ranking/RankingLeaderboard').then((mod) => ({
    default: mod.RankingLeaderboard,
  }))
);

export const LazyStreakDisplay = lazy(() =>
  import('@/components/ranking/StreakDisplay').then((mod) => ({
    default: mod.StreakDisplay,
  }))
);

export const LazyStreakGrid = lazy(() =>
  import('@/components/ranking/StreakDisplay').then((mod) => ({
    default: mod.StreakGrid,
  }))
);

export const LazyBadgeGroup = lazy(() =>
  import('@/components/ranking/BadgeDisplay').then((mod) => ({
    default: mod.BadgeGroup,
  }))
);

/**
 * Componente Loading Skeleton genérico
 */
interface SkeletonLoaderProps {
  count?: number;
  height?: string;
}

export function SkeletonLoader({ count = 3, height = 'h-20' }: SkeletonLoaderProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} rounded-lg bg-gradient-to-r from-slate-800/50 to-slate-700/50 animate-pulse`}
        />
      ))}
    </div>
  );
}

/**
 * Wrapper com Suspense para componentes lazy
 */
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export function LazyWrapper({
  children,
  fallback,
  onError,
}: LazyWrapperProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-6">
            <SkeletonLoader count={3} />
          </div>
        )
      }
    >
      <ErrorBoundary onError={onError}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}

/**
 * Error Boundary para componentes lazy-loaded
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error in lazy component:', error);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center">
          <p className="text-red-400 font-semibold">Erro ao Carregar Componente</p>
          <p className="text-xs text-red-300/70 mt-1">Tente recarregar a página</p>
        </div>
      );
    }

    return this.props.children;
  }
}
