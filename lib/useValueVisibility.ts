import { useState, useCallback } from 'react';

export function useValueVisibility() {
  const [isVisible, setIsVisible] = useState(true);

  const toggle = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  return {
    isVisible,
    toggle,
  };
}
