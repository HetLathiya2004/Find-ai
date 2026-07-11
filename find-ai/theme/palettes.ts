import { Brand } from './brand';
import type { ColorPalette, ColorScheme } from './types';

export const DarkColors: ColorPalette = {
  bg: '#10140F',
  surface1: '#171C15',
  surface2: '#20271D',
  surfaceRaised: '#293224',
  surfaceWarm: '#2B2414',

  borderDefault: '#303A2C',
  borderStrong: '#45533E',

  textPrimary: '#F7F9F5',
  textSecondary: '#AEB8A9',
  textMuted: '#788373',
  textFaint: '#505B4B',

  accentSoft: '#DFF8CC',
  locked: '#505B4B',
  ...Brand,
};

export const LightColors: ColorPalette = {
  bg: '#F3F6EF',
  surface1: '#FFFFFF',
  surface2: '#E7EDE1',
  surfaceRaised: '#FFFFFF',
  surfaceWarm: '#FFF6DF',

  borderDefault: '#CFD8C8',
  borderStrong: '#9AAB90',

  textPrimary: '#162015',
  textSecondary: '#4F5C49',
  textMuted: '#6F7C69',
  textFaint: '#93A08C',

  accentSoft: '#2F6B0C',
  locked: '#93A08C',
  ...Brand,
};

/**
 * Default dark palette for non-UI helpers (e.g. domainColor).
 * UI should use `useColors()` so it reacts to theme changes.
 */
export const Colors = DarkColors;

export function paletteFor(scheme: ColorScheme): ColorPalette {
  return scheme === 'light' ? LightColors : DarkColors;
}
