export const Typography = {
  // Font Family
  fontFamily: {
    regular: 'Nunito-Regular',
    medium: 'Nunito-SemiBold',
    bold: 'Nunito-Bold',
  },

  // Font Sizes (matching the web app scale)
  size: {
    caption: 10, // uppercase tracking labels
    xs: 12, // small captions
    sm: 14, // body / secondary text
    base: 16, // descriptions, form inputs
    question: 15, // quiz question text
    lg: 18, // sub-headings
    xl: 20, // section headings
    '2xl': 24, // page titles
    '3xl': 30, // large stat numbers
    '4xl': 36, // hero text
    '5xl': 48, // XP rewards, streak counts
    '6xl': 60, // score percentages, streak emoji
  },

  // Line Heights (multipliers)
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7, // lesson body text
  },

  // Letter Spacing
  tracking: {
    wider: 1.1, // uppercase labels
    normal: 0,
  },
} as const;
