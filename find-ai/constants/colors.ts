export const Colors = {
  // Backgrounds
  bg: '#07110F',
  surface1: '#0E1B18',
  surface2: '#142520',
  surfaceRaised: '#193029',
  surfaceWarm: '#211D16',

  // Borders
  borderDefault: '#213A33',
  borderStrong: '#315247',

  // Text
  textPrimary: '#F7FBF8',
  textSecondary: '#A8BCB4',
  textMuted: '#6F8980',
  textFaint: '#466158',

  // Accent Colors
  accent: '#10B981', // Emerald green — XP, success, primary CTA
  accentMuted: '#065F46', // Dark emerald — accent backgrounds
  accentSoft: '#D7F8EA',
  accentGlow: '#6EE7B7',
  inkOnAccent: '#03261C',
  warm: '#F7C66A',
  warmMuted: '#57401D',
  danger: '#EF4444', // Red — hearts lost, errors
  dangerMuted: '#7F1D1D', // Dark red — danger backgrounds
  warning: '#F59E0B', // Amber — in-progress, streaks
  warningMuted: '#78350F', // Dark amber — warning backgrounds

  // Domain Colors (for concept categorization)
  domainMarkets: '#3B82F6', // Blue
  domainInvesting: '#10B981', // Green
  domainMacro: '#F97316', // Orange
  domainCorporate: '#8B5CF6', // Purple

  // Semantic
  correct: '#10B981',
  incorrect: '#EF4444',
  locked: '#333333',
} as const;

// Gradients (as tuple pairs for LinearGradient)
export const Gradients = {
  hero: ['#132A23', '#07110F'] as const,
  success: ['#0B4F3B', '#07110F'] as const,
  xp: ['#34D399', '#059669'] as const,
  warm: ['#3B301B', '#0E1B18'] as const,
};
