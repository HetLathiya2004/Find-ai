/** Resolved appearance used to paint the UI. */
export type ColorScheme = 'light' | 'dark';

/** User preference — `system` follows the OS. */
export type ThemePreference = 'system' | ColorScheme;

export type ColorPalette = {
  // Backgrounds
  bg: string;
  surface1: string;
  surface2: string;
  surfaceRaised: string;
  surfaceWarm: string;

  // Borders
  borderDefault: string;
  borderStrong: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;

  // Accent Colors
  accent: string;
  accentMuted: string;
  accentSoft: string;
  accentGlow: string;
  inkOnAccent: string;
  accentBlue: string;
  accentBlueDark: string;
  warm: string;
  warmMuted: string;
  danger: string;
  dangerMuted: string;
  warning: string;
  warningMuted: string;

  // Domain Colors (for concept categorization)
  domainMarkets: string;
  domainInvesting: string;
  domainMacro: string;
  domainCorporate: string;

  // Semantic
  correct: string;
  incorrect: string;
  locked: string;
};

export type GradientPalette = {
  hero: readonly [string, string];
  success: readonly [string, string];
  xp: readonly [string, string];
  warm: readonly [string, string];
};
