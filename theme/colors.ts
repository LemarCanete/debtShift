/**
 * DebtShift Design System - Colors
 * Based on Constitution III: User Experience Consistency
 *
 * Design Principles:
 * - Calm not clinical
 * - Progress over perfection
 * - Shame-free language
 */

export const colors = {
  // Base colors (Dark Theme)
  background: '#0A0A0B',
  surface: '#141416',
  surfaceElevated: '#1C1C1F',

  // Primary - Amber (warmth, positivity)
  primary: '#F59E0B',
  primaryLight: '#FBBF24',
  primaryDark: '#D97706',

  // Success - Emerald (progress, achievement)
  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',

  // Danger - Red (alerts, negative balances)
  danger: '#EF4444',
  dangerLight: '#F87171',
  dangerDark: '#DC2626',

  // Warning - Amber
  warning: '#F59E0B',
  warningLight: '#FBBF24',

  // Text
  text: {
    primary: '#FAFAFA',
    secondary: '#A1A1AA',
    muted: '#71717A',
    inverse: '#0A0A0B',
  },

  // Borders
  border: '#27272A',
  borderLight: '#3F3F46',

  // Debt colors (for visual distinction)
  debt: {
    creditCard: '#6366F1', // Indigo
    studentLoan: '#10B981', // Emerald
    personalLoan: '#8B5CF6', // Violet
    medical: '#EC4899', // Pink
    auto: '#14B8A6', // Teal
    mortgage: '#F59E0B', // Amber
    other: '#6B7280', // Gray
  },

  // Mood colors (for journal)
  mood: {
    1: '#EF4444', // Very low - Red
    2: '#F97316', // Low - Orange
    3: '#F59E0B', // Neutral - Amber
    4: '#84CC16', // Good - Lime
    5: '#10B981', // Great - Emerald
  },

  // Transparency
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
} as const;

export type ColorKey = keyof typeof colors;
export type TextColorKey = keyof typeof colors.text;
export type DebtColorKey = keyof typeof colors.debt;
export type MoodColorKey = keyof typeof colors.mood;
