/**
 * Compatibility shim — prefer `@/theme`.
 * Kept so non-UI helpers (e.g. gamification) can read stable brand tokens.
 */
export {
  Brand,
  Colors,
  DarkColors,
  DarkGradients,
  Gradients,
  LightColors,
  LightGradients,
  gradientsFor,
  paletteFor,
  type ColorPalette,
  type ColorScheme,
  type GradientPalette,
} from '@/theme';
