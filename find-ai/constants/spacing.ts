export const Spacing = {
  // Radii
  radius: {
    card: 16,
    button: 12,
    tag: 8,
    full: 9999, // progress bars, pills
    xl: 16, // lesson content cards
  },

  // Padding
  padding: {
    screen: 16, // horizontal screen padding
    card: 20, // card internal padding (p-5)
    cardLg: 24, // large card padding (p-6)
  },

  // Gaps
  gap: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
  },

  // Bottom tab bar
  tabBarHeight: 80,

  // Safe area bottom padding (for content above tab bar)
  bottomOffset: 100,
} as const;
