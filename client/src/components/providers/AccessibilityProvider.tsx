import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  focusVisible: boolean;
  screenReader: boolean;
}

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreference: (
    key: keyof AccessibilityPreferences,
    value: boolean
  ) => void;
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(
    () => {
      const stored = localStorage.getItem('yuthub-accessibility');
      const defaults: AccessibilityPreferences = {
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
          .matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        largeText: false,
        focusVisible: true,
        screenReader: false,
      };

      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    }
  );

  const updatePreference = (
    key: keyof AccessibilityPreferences,
    value: boolean
  ) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('yuthub-accessibility', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const root = document.documentElement;

    // Apply accessibility classes
    root.classList.toggle('reduced-motion', preferences.reducedMotion);
    root.classList.toggle('high-contrast', preferences.highContrast);
    root.classList.toggle('large-text', preferences.largeText);
    root.classList.toggle('focus-visible-enabled', preferences.focusVisible);

    // Update CSS custom properties
    root.style.setProperty(
      '--animation-duration',
      preferences.reducedMotion ? '0s' : '0.2s'
    );
    root.style.setProperty(
      '--transition-duration',
      preferences.reducedMotion ? '0s' : '0.15s'
    );

    // Listen for system preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      updatePreference('reducedMotion', e.matches);
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      updatePreference('highContrast', e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, [preferences]);

  return (
    <AccessibilityContext.Provider value={{ preferences, updatePreference }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      'useAccessibility must be used within AccessibilityProvider'
    );
  }
  return context;
};
