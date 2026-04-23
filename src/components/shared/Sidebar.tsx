import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

import { useTheme, useThemedStyles, spacing, radius, typography } from '@/theme';

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Today', href: '/', glyph: '✦' },
  { label: 'Jar', href: '/jar', glyph: '◎' },
  { label: 'History', href: '/history', glyph: '◷' },
  { label: 'Settings', href: '/settings', glyph: '✿' },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.sidebar}>
      {/* App name */}
      <View style={styles.brand}>
        <Text style={styles.brandName}>sleepy</Text>
        <Text style={styles.brandSub}>to-do</Text>
      </View>

      {/* Nav items */}
      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/' || pathname === '/index'
              : pathname.startsWith(item.href);

          return (
            <Pressable
              key={item.href}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => router.push(item.href as any)}
            >
              <Text style={[
                styles.navGlyph,
                { color: isActive ? theme.colors.primary : theme.colors.textSubtle },
              ]}>
                {item.glyph}
              </Text>
              <Text style={[
                styles.navLabel,
                { color: isActive ? theme.colors.text : theme.colors.textMuted },
                isActive && styles.navLabelActive,
              ]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Bottom decoration */}
      <View style={styles.sidebarBottom}>
        <Text style={styles.sidebarDecor}>✦ ♥ ☁ ✿</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(theme: import('@/types').Theme) {
  return StyleSheet.create({
    sidebar: {
      width: 220,
      height: '100%' as any,
      backgroundColor: theme.colors.surface,
      borderRightWidth: 1,
      borderRightColor: theme.colors.taskCardBorder,
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      justifyContent: 'space-between',
    },
    brand: {
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.xl,
      gap: 2,
    },
    brandName: {
      fontSize: typography.size.xl,
      fontWeight: typography.weight.medium,
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    brandSub: {
      fontSize: typography.size.sm,
      color: theme.colors.primary,
      letterSpacing: 1,
    },
    nav: {
      flex: 1,
      gap: spacing.xs,
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
    },
    navItemActive: {
      backgroundColor: theme.colors.primary + '15',
    },
    navGlyph: {
      fontSize: 16,
      width: 20,
      textAlign: 'center',
    },
    navLabel: {
      fontSize: typography.size.md,
    },
    navLabelActive: {
      fontWeight: typography.weight.medium,
    },
    sidebarBottom: {
      alignItems: 'center',
      paddingTop: spacing.lg,
    },
    sidebarDecor: {
      fontSize: typography.size.sm,
      color: theme.colors.textSubtle,
      letterSpacing: 4,
    },
  });
}
