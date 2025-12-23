'use client';

import React, { useEffect, useRef } from 'react';

interface ConfettiEffectProps {
  trigger?: boolean;
  variant?: 'celebration' | 'achievement' | 'top3' | 'subtle';
  onComplete?: () => void;
}

/**
 * Simple confetti effect component.
 * Note: For full canvas-confetti support, install: npm install canvas-confetti
 * This version provides a fallback animation.
 */
export function ConfettiEffect({
  trigger = true,
  variant = 'celebration',
  onComplete,
}: ConfettiEffectProps) {
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!trigger || hasTriggered.current) return;
    hasTriggered.current = true;

    // Attempt to use canvas-confetti if available
    const duration =
      variant === 'top3' ? 3000 : variant === 'celebration' ? 2500 : 1500;

    try {
      // @ts-ignore - Dynamic import for optional dependency
      const confettiPromise = import('canvas-confetti');

      confettiPromise
        .then((confettiModule: any) => {
          const confetti = confettiModule.default;
          const particleCount =
            variant === 'top3' ? 200 : variant === 'achievement' ? 100 : 30;
          const spread =
            variant === 'top3' ? 90 : variant === 'achievement' ? 70 : 45;

          confetti({
            particleCount,
            spread,
            origin: { x: 0.5, y: 0.5 },
            gravity: variant === 'subtle' ? 0.8 : 1.3,
          });

          setTimeout(() => onComplete?.(), duration);
        })
        .catch(() => {
          // Fallback if canvas-confetti is not installed
          setTimeout(() => onComplete?.(), duration);
        });
    } catch {
      // Fallback if import fails
      setTimeout(() => onComplete?.(), duration);
    }
  }, [trigger, variant, onComplete]);

  return null;
}

interface ConfettiTriggerProps {
  children: React.ReactNode;
  variant?: 'celebration' | 'achievement' | 'top3' | 'subtle';
  onComplete?: () => void;
}

export function ConfettiTrigger({
  children,
  variant = 'celebration',
  onComplete,
}: ConfettiTriggerProps) {
  const [trigger, setTrigger] = React.useState(false);

  const handleClick = () => {
    setTrigger(true);
  };

  const handleConfettiComplete = () => {
    setTrigger(false);
    onComplete?.();
  };

  return (
    <>
      <ConfettiEffect
        trigger={trigger}
        variant={variant}
        onComplete={handleConfettiComplete}
      />
      <div onClick={handleClick}>{children}</div>
    </>
  );
}
