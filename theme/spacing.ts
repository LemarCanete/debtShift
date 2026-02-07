/**
 * DebtShift Design System - Spacing
 * Based on Constitution III: User Experience Consistency
 *
 * Uses a 4px base unit for consistent spacing throughout the app.
 */

export const spacing = {
  // Base spacing scale (multiples of 4)
  0: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,

  // Numeric scale for flexibility
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

// Layout constants
export const layout = {
  // Screen padding
  screenPadding: spacing.md,
  screenPaddingHorizontal: spacing.md,
  screenPaddingVertical: spacing.lg,

  // Card spacing
  cardPadding: spacing.md,
  cardGap: spacing.md,

  // List item spacing
  listItemPadding: spacing.md,
  listItemGap: spacing.sm,

  // Input height
  inputHeight: 48,
  inputHeightSmall: 40,
  inputHeightLarge: 56,

  // Button height
  buttonHeight: 48,
  buttonHeightSmall: 36,
  buttonHeightLarge: 56,

  // Bottom tab bar
  tabBarHeight: 80,
  tabBarPaddingBottom: 24,

  // Safe area defaults (can be overridden by SafeAreaView)
  safeAreaTop: 44,
  safeAreaBottom: 34,
} as const;

export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ShadowKey = keyof typeof shadows;
