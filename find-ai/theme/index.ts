/**
 * Theme module — single public entry for Find.ai appearance.
 *
 * Layout:
 *   types.ts          shared type contracts
 *   brand.ts          stable brand/domain accents
 *   palettes.ts       light/dark color tokens
 *   gradients.ts      light/dark gradient tokens
 *   navigation.ts     React Navigation theme mapping
 *   preference.ts     persist / resolve / cycle preference
 *   labels.ts         UI copy for preference values
 *   ThemeProvider.tsx React context + hooks
 */

export type {
  ColorPalette,
  ColorScheme,
  GradientPalette,
  ThemePreference,
} from './types';

export { Brand } from './brand';
export { Colors, DarkColors, LightColors, paletteFor } from './palettes';
export { DarkGradients, Gradients, LightGradients, gradientsFor } from './gradients';
export { buildNavigationTheme } from './navigation';
export {
  loadThemePreference,
  nextThemePreference,
  oppositeColorScheme,
  resolveColorScheme,
  saveThemePreference,
} from './preference';
export { THEME_LABELS } from './labels';
export {
  AppThemeProvider,
  useColors,
  useTheme,
  type ThemeContextValue,
} from './ThemeProvider';
