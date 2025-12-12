'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ValueVisibilityContextType {
  isValuesVisible: boolean;
  toggleValuesVisibility: () => void;
}

const ValueVisibilityContext = createContext<ValueVisibilityContextType | undefined>(undefined);

export function ValueVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [isValuesVisible, setIsValuesVisible] = useState(true);

  const toggleValuesVisibility = useCallback(() => {
    setIsValuesVisible(prev => !prev);
  }, []);

  return (
    <ValueVisibilityContext.Provider value={{ isValuesVisible, toggleValuesVisibility }}>
      {children}
    </ValueVisibilityContext.Provider>
  );
}

export function useValueVisibility() {
  const context = useContext(ValueVisibilityContext);
  if (!context) {
    throw new Error('useValueVisibility deve ser usado dentro de ValueVisibilityProvider');
  }
  return context;
}
