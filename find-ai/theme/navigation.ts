import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import type { ColorPalette, ColorScheme } from './types';

/** Maps Find.ai palettes onto React Navigation's theme shape. */
export function buildNavigationTheme(scheme: ColorScheme, colors: ColorPalette): Theme {
  const base = scheme === 'light' ? DefaultTheme : DarkTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      background: colors.bg,
      card: colors.bg,
      border: colors.borderDefault,
      text: colors.textPrimary,
      primary: colors.accent,
    },
  };
}
