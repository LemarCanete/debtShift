/**
 * DebtShift Design System - Typography
 * Based on Constitution III: User Experience Consistency
 *
 * Uses system fonts for optimal performance and native feel.
 * Scale: hero (32px) → caption (12px)
 */

import { TextStyle, Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  // Hero - Main dashboard numbers, celebration text
  hero: {
    fontFamily,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
  } as TextStyle,

  // Title - Screen titles, section headers
  title: {
    fontFamily,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
  } as TextStyle,

  // Subtitle - Card titles, subsection headers
  subtitle: {
    fontFamily,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  } as TextStyle,

  // Body - Main content text
  body: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  } as TextStyle,

  // Body Bold - Emphasized body text
  bodyBold: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  } as TextStyle,

  // Small - Secondary information
  small: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  } as TextStyle,

  // Small Bold - Labels, badges
  smallBold: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  } as TextStyle,

  // Caption - Timestamps, helper text
  caption: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  } as TextStyle,

  // Caption Bold - Emphasized captions
  captionBold: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  } as TextStyle,

  // Button text styles
  button: {
    large: {
      fontFamily,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600',
    } as TextStyle,
    medium: {
      fontFamily,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '600',
    } as TextStyle,
    small: {
      fontFamily,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '600',
    } as TextStyle,
  },

  // Input text
  input: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  } as TextStyle,

  // Label text
  label: {
    fontFamily,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  } as TextStyle,
} as const;

export type TypographyKey = keyof typeof typography;
