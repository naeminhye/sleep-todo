/**
 * useThemedStyles — creates a StyleSheet from the active theme.
 *
 * Usage:
 *   const styles = useThemedStyles(makeStyles);
 *
 *   function makeStyles(theme: Theme) {
 *     return StyleSheet.create({
 *       container: { backgroundColor: theme.colors.background },
 *     });
 *   }
 *
 * The factory is only re-run when the active theme changes.
 */

import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "./ThemeContext";
import type { Theme } from "../types";

type StyleFactory<T extends StyleSheet.NamedStyles<T>> = (theme: Theme) => T;

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: StyleFactory<T>
): T {
  const { theme } = useTheme();
  // Re-create only when the theme id changes — not on every render
  return useMemo(() => factory(theme), [theme.id]);
}
