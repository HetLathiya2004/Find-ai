export const Colors = {
  // Backgrounds
  bg: '#10140F',
  surface1: '#171C15',
  surface2: '#20271D',
  surfaceRaised: '#293224',
  surfaceWarm: '#2B2414',

  // Borders
  borderDefault: '#303A2C',
  borderStrong: '#45533E',

  // Text
  textPrimary: '#F7F9F5',
  textSecondary: '#AEB8A9',
  textMuted: '#788373',
  textFaint: '#505B4B',

  // Accent Colors
  accent: '#58CC02', // Buck green — XP, success, primary CTA
  accentMuted: '#58A700', // 3D button rim / deep green
  accentSoft: '#DFF8CC',
  accentGlow: '#86E83D',
  inkOnAccent: '#FFFFFF',
  accentBlue: '#1CB0F6',
  accentBlueDark: '#1899D6',
  warm: '#FFC800',
  warmMuted: '#E5A700',
  danger: '#FF4B4B', // Red — hearts lost, errors
  dangerMuted: '#E63F3F', // Dark red — danger backgrounds
  warning: '#FFC800', // Gold — in-progress, streaks
  warningMuted: '#E5A700', // Dark gold — warning backgrounds

  // Domain Colors (for concept categorization)
  domainMarkets: '#1CB0F6', // Blue
  domainInvesting: '#58CC02', // Green
  domainMacro: '#F97316', // Orange
  domainCorporate: '#8B5CF6', // Purple

  // Semantic
  correct: '#58CC02',
  incorrect: '#FF4B4B',
  locked: '#505B4B',
} as const;

// Gradients (as tuple pairs for LinearGradient)
export const Gradients = {
  hero: ['#1E2A16', '#10140F'] as const,
  success: ['#274E12', '#10140F'] as const,
  xp: ['#86E83D', '#58A700'] as const,
  warm: ['#3D3311', '#171C15'] as const,
};
