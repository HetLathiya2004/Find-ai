export const Colors = {
  // Backgrounds
  bg: '#000000',
  surface1: '#0D0D0D',
  surface2: '#141414',

  // Borders
  borderDefault: '#1F1F1F',
  borderStrong: '#2A2A2A',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#999999',
  textMuted: '#444444',
  textFaint: '#333333',

  // Accent Colors
  accent: '#10B981', // Emerald green — XP, success, primary CTA
  accentMuted: '#065F46', // Dark emerald — accent backgrounds
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
  hero: ['#000000', '#0D1117'] as const,
  success: ['#065F46', '#000000'] as const,
  xp: ['#10B981', '#059669'] as const,
};
