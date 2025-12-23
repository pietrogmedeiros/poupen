'use client';

import React, { useState, useEffect } from 'react';
import { ConfettiEffect } from './ConfettiEffect';
import { BadgeDisplay } from './BadgeDisplay';
import { BadgeType } from '@/lib/types/ranking';

interface AchievementNotificationProps {
  badges: BadgeType[];
  isNewAchievement?: boolean;
  onDismiss?: () => void;
  className?: string;
}

/**
 * AchievementNotification - Exibe notificação animada de novas conquistas
 * Com confetti e efeitos visuais para manter engajamento
 */
export function AchievementNotification({
  badges,
  isNewAchievement = false,
  onDismiss,
  className = '',
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(isNewAchievement);
  const [showConfetti, setShowConfetti] = useState(isNewAchievement);

  // Auto-dismiss após 5 segundos se tiver badges
  useEffect(() => {
    if (!isNewAchievement || badges.length === 0) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isNewAchievement, badges.length, onDismiss]);

  if (!isVisible || badges.length === 0) {
    return null;
  }

  const newBadgesCount = badges.length;

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && (
        <ConfettiEffect
          trigger={true}
          variant="achievement"
          onComplete={() => setShowConfetti(false)}
        />
      )}

      {/* Notification Container */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none ${className}`}>
        <div
          className="pointer-events-auto rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-xl shadow-2xl max-w-md mx-4 animate-in fade-in scale-in duration-300"
          style={{
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(16, 185, 129, 0.1)',
          }}
        >
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  🎉 Parabéns!
                </span>
              </h2>
              <p className="text-slate-300 text-sm">
                Você conquistou {newBadgesCount} {newBadgesCount === 1 ? 'nova badge' : 'novas badges'}!
              </p>
            </div>

            {/* Badges Display */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {badges.map((badge) => (
                <div
                  key={badge}
                  className="animate-in zoom-in-50 duration-500"
                  style={{
                    animation: `fadeInScale 0.6s ease-out`,
                  }}
                >
                  <BadgeDisplay
                    badge={badge}
                    size="lg"
                    showLabel={true}
                    animated={true}
                    glowEffect={true}
                  />
                </div>
              ))}
            </div>

            {/* Message */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 mb-6">
              <p className="text-center text-sm text-emerald-200">
                ✨ Continue assim para conquistar mais badges e subir no ranking!
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setIsVisible(false);
                onDismiss?.();
              }}
              className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/50 active:scale-95"
            >
              Entendi!
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

/**
 * Hook para gerenciar estado de notificações de achievement
 */
export function useAchievementNotification() {
  const [notification, setNotification] = useState<{
    badges: BadgeType[];
    isNew: boolean;
  } | null>(null);

  const showAchievement = (badges: BadgeType[]) => {
    if (badges.length > 0) {
      setNotification({ badges, isNew: true });
    }
  };

  const dismissAchievement = () => {
    setNotification(null);
  };

  return {
    notification,
    showAchievement,
    dismissAchievement,
  };
}
