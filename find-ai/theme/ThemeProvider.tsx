import type { Theme } from '@react-navigation/native';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { gradientsFor } from './gradients';
import { buildNavigationTheme } from './navigation';
import { paletteFor } from './palettes';
import {
  loadThemePreference,
  nextThemePreference,
  oppositeColorScheme,
  resolveColorScheme,
  saveThemePreference,
} from './preference';
import type { ColorPalette, ColorScheme, GradientPalette, ThemePreference } from './types';

export interface ThemeContextValue {
  /** Resolved light/dark used for painting the UI. */
  colorScheme: ColorScheme;
  /** User preference: system follows the OS. */
  preference: ThemePreference;
  colors: ColorPalette;
  gradients: GradientPalette;
  isDark: boolean;
  navigationTheme: Theme;
  setPreference: (preference: ThemePreference) => void;
  /** Cycle system → light → dark → system. */
  cyclePreference: () => void;
  /** Flip between light and dark (locks preference off system). */
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(loadThemePreference);

  const colorScheme = resolveColorScheme(preference, systemScheme);
  const colors = useMemo(() => paletteFor(colorScheme), [colorScheme]);
  const gradients = useMemo(() => gradientsFor(colorScheme), [colorScheme]);
  const navigationTheme = useMemo(
    () => buildNavigationTheme(colorScheme, colors),
    [colorScheme, colors],
  );

  useEffect(() => {
    saveThemePreference(preference);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
  }, []);

  const cyclePreference = useCallback(() => {
    setPreferenceState((prev) => nextThemePreference(prev));
  }, []);

  const toggleColorScheme = useCallback(() => {
    setPreferenceState((prev) => oppositeColorScheme(resolveColorScheme(prev, systemScheme)));
  }, [systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colorScheme,
      preference,
      colors,
      gradients,
      isDark: colorScheme === 'dark',
      navigationTheme,
      setPreference,
      cyclePreference,
      toggleColorScheme,
    }),
    [
      colorScheme,
      preference,
      colors,
      gradients,
      navigationTheme,
      setPreference,
      cyclePreference,
      toggleColorScheme,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within AppThemeProvider');
  }
  return ctx;
}

/** Convenience alias for palette access. */
export function useColors(): ColorPalette {
  return useTheme().colors;
}
