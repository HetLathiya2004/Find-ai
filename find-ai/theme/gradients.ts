import type { ColorScheme, GradientPalette } from './types';

export const DarkGradients: GradientPalette = {
  hero: ['#1E2A16', '#10140F'],
  success: ['#274E12', '#10140F'],
  xp: ['#86E83D', '#58A700'],
  warm: ['#3D3311', '#171C15'],
};

export const LightGradients: GradientPalette = {
  hero: ['#E5F3D8', '#F3F6EF'],
  success: ['#D8F5BE', '#F3F6EF'],
  xp: ['#86E83D', '#58A700'],
  warm: ['#FFF1C2', '#FFFFFF'],
};

/** @deprecated Prefer `gradientsFor(scheme)` or `useTheme().gradients`. */
export const Gradients = DarkGradients;

export function gradientsFor(scheme: ColorScheme): GradientPalette {
  return scheme === 'light' ? LightGradients : DarkGradients;
}
