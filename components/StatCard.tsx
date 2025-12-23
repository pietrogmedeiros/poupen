'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  subtitle?: string;
  variant?: 'primary' | 'success' | 'error' | 'warning';
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
}

export function StatCard({
  title,
  value,
  icon,
  subtitle,
  variant = 'primary',
  trend,
}: StatCardProps) {
  const variantStyles = {
    primary: 'bg-[var(--accent-secondary)] text-white',
    success: 'bg-[var(--status-success)] text-white',
    error: 'bg-[var(--status-error)] text-white',
    warning: 'bg-[var(--status-warning)] text-white',
  };

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4 md:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs md:text-sm font-medium text-[var(--text-secondary)] mb-2">
            {title}
          </p>
          <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[var(--text-tertiary)]">{subtitle}</p>
          )}
          {trend && (
            <div className={`text-xs mt-2 flex items-center gap-1 ${
              trend.direction === 'up' ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]'
            }`}>
              <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
              <span>{trend.percentage}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`${variantStyles[variant]} rounded-lg p-3 flex-shrink-0`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
