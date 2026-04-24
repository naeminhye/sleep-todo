import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useJarStore } from '../../src/stores/jarStore';
import { useThemeStore } from '../../src/stores/themeStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useTheme } from '../../src/theme';
import { useThemedStyles } from '../../src/theme/useThemedStyles';
import { spacing, typography, radius, fonts } from '../../src/theme/tokens';
import { JarView } from '../../src/components/jar/JarView';
import { DailyEncouragement } from '../../src/components/shared/DailyEncouragement';

export default function JarScreen() {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const todayEntries = useJarStore((s) => s.todayEntries);
  const history = useJarStore((s) => s.history);
  const activeTheme = useThemeStore((s) => s.theme);
  const userName = useSettingsStore((s) => s.settings.userName);
  const showEncouragement = useSettingsStore((s) => s.settings.dailyEncouragementEnabled);

  const totalStars = Object.values(history).reduce((sum, r) => sum + r.totalCompleted, 0)
    + todayEntries.length;
  const totalDays = Object.keys(history).length + (todayEntries.length > 0 ? 1 : 0);

  const context = todayEntries.length === 0 ? 'jarEmpty'
    : todayEntries.length < 3 ? 'jarFilling' : 'jarFull';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.push('/history' as any)}>
            <Text style={styles.historyLink}>← your quiet month</Text>
          </Pressable>
          <Text style={styles.headerRight}>✦</Text>
        </View>

        {/* Title */}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>your little collection</Text>
          <Text style={styles.subtitle}>
            {totalStars} stars{'\n'}
            from {totalDays} cozy {totalDays === 1 ? 'day' : 'days'} ♡
          </Text>
        </View>

        {/* Jar illustration */}
        <View style={styles.jarWrap}>
          <JarView
            entries={todayEntries}
            totalStars={totalStars}
            shape={activeTheme.particleShape}
          />
        </View>

        {/* Milestones */}
        {totalStars > 0 && (
          <View style={styles.milestones}>
            <Text style={styles.milestonesLabel}>little milestones</Text>
            <View style={styles.milestoneRow}>
              {totalDays >= 7 && (
                <View style={[styles.milestoneBadge, { backgroundColor: theme.colors.surfaceAlt }]}>
                  <Text style={styles.milestoneStar}>✦</Text>
                  <Text style={styles.milestoneText}>7 day{'\n'}streak</Text>
                </View>
              )}
              {totalStars >= 50 && (
                <View style={[styles.milestoneBadge, { backgroundColor: theme.colors.surfaceAlt }]}>
                  <Text style={styles.milestoneStar}>★★</Text>
                  <Text style={styles.milestoneText}>50 stars{'\n'}full jar</Text>
                </View>
              )}
              {totalDays >= 30 && (
                <View style={[styles.milestoneBadge, { backgroundColor: theme.colors.surfaceAlt }]}>
                  <Text style={styles.milestoneStar}>◑</Text>
                  <Text style={styles.milestoneText}>one{'\n'}month</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Encouragement */}
        {showEncouragement && (
          <View style={styles.encourageWrap}>
            <DailyEncouragement context={context} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(theme: import('../../src/types').Theme) {
  return StyleSheet.create({
    root: { flex: 1 },
    scroll: { paddingBottom: spacing.xxxl, gap: spacing.xl },
    header: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.xl, paddingTop: spacing.lg,
    },
    historyLink: {
      fontSize: typography.size.sm, color: theme.colors.primary,
      fontFamily: fonts.regular,
    },
    headerRight: { fontSize: 16, color: theme.colors.primary },
    titleWrap: { paddingHorizontal: spacing.xl, gap: spacing.xs },
    title: {
      fontSize: typography.size.xxl, color: theme.colors.text,
      fontFamily: fonts.display,
    },
    subtitle: {
      fontSize: typography.size.sm, color: theme.colors.textMuted,
      fontFamily: fonts.regular, lineHeight: 20,
    },
    jarWrap: { alignItems: 'center', paddingVertical: spacing.md },
    milestones: { paddingHorizontal: spacing.xl, gap: spacing.sm },
    milestonesLabel: {
      fontSize: typography.size.xs, color: theme.colors.textSubtle,
      fontFamily: fonts.medium, letterSpacing: 0.5,
    },
    milestoneRow: { flexDirection: 'row', gap: spacing.sm },
    milestoneBadge: {
      borderRadius: radius.md, padding: spacing.md,
      alignItems: 'center', gap: spacing.xs, minWidth: 72,
    },
    milestoneStar: { fontSize: typography.size.md, color: theme.colors.accent },
    milestoneText: {
      fontSize: typography.size.xs, color: theme.colors.textMuted,
      fontFamily: fonts.regular, textAlign: 'center',
    },
    encourageWrap: { paddingHorizontal: spacing.xl },
  });
}