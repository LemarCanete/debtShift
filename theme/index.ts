/**
 * DebtShift Design System - Theme Barrel Export
 *
 * Import everything from '@/theme' for consistent styling.
 *
 * @example
 * import { colors, typography, spacing } from '@/theme';
 */

export * from './colors';
export * from './typography';
export * from './spacing';

// Combined theme object for convenience
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows, layout } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
} as const;

export type Theme = typeof theme;
