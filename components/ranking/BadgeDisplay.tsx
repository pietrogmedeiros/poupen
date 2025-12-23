'use client';

import React from 'react';
import { BADGES, BadgeType } from '@/lib/types/ranking';
import { themeClasses } from '@/lib/theme-classes';

interface BadgeDisplayProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  glowEffect?: boolean;
}

export function BadgeDisplay({
  badge,
  size = 'md',
  showLabel = true,
  animated = true,
  glowEffect = true,
}: BadgeDisplayProps) {
  const badgeData = BADGES[badge];

  if (!badgeData) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-sm px-2 py-1 gap-1',
    md: 'text-base px-3 py-1.5 gap-2',
    lg: 'text-lg px-4 py-2 gap-2',
  };

  const iconSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const glowClasses = glowEffect
    ? 'shadow-lg hover:shadow-xl transition-shadow duration-300'
    : '';

  const animationClasses = animated
    ? 'transition-all duration-300 hover:scale-110 cursor-pointer'
    : '';

  return (
    <div
      className={`inline-flex items-center rounded-full dark:bg-gradient-to-r dark:from-slate-900/50 dark:to-slate-800/50 dark:border-slate-700/50 backdrop-blur-sm ${sizeClasses[size]} ${glowClasses} ${animationClasses}`}
      style={{
        boxShadow: glowEffect
          ? `0 0 20px ${badgeData.color}40, inset 0 0 20px ${badgeData.color}10`
          : undefined,
      }}
      title={badgeData.description}
    >
      <span className={iconSizes[size]}>{badgeData.icon}</span>
      {showLabel && (
        <span
          className={`font-semibold dark:text-white`}
          style={{
            color: badgeData.color,
            textShadow: `0 0 10px ${badgeData.color}40`,
          }}
        >
          {badgeData.label}
        </span>
      )}
    </div>
  );
}

interface BadgeGroupProps {
  badges: BadgeType[];
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  maxDisplay?: number;
  className?: string;
}

export function BadgeGroup({
  badges,
  size = 'md',
  showLabel = true,
  animated = true,
  maxDisplay = 5,
  className = '',
}: BadgeGroupProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = Math.max(0, badges.length - maxDisplay);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayBadges.map((badge) => (
        <BadgeDisplay
          key={badge}
          badge={badge}
          size={size}
          showLabel={showLabel}
          animated={animated}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={`inline-flex items-center rounded-full dark:bg-slate-900/50 dark:border-slate-700/50 px-3 py-1.5 text-sm font-semibold dark:text-slate-300 dark:hover:text-white transition-colors`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
