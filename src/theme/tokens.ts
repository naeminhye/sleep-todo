/**
 * Design tokens shared across all themes.
 * These never change with the theme — only colors do.
 */

import { Platform } from 'react-native';

// ─── Font families ────────────────────────────────────────────────────────────

export const fonts = {
  regular: 'Cause_400Regular',
  medium:  'Cause_500Medium',
  display: 'CherryBombOne_400Regular',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    xxxl: 34,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  weight: {
    regular: '400' as const,
    medium:  '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export function cardShadow(color: string) {
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
    web: {
      // @ts-ignore
      boxShadow: `0 2px 8px ${color}14`,
    },
    default: {},
  });
}
