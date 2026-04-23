import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useJarStore } from '../../src/stores/jarStore';
import { useThemeStore } from '../../src/stores/themeStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useTheme } from '../../src/theme';
import { useThemedStyles } from '../../src/theme/useThemedStyles';
import { spacing, typography, radius } from '../../src/theme/tokens';
import { JarView } from '../../src/components/jar/JarView';
import { DailyEncouragement } from '../../src/components/shared/DailyEncouragement';
import { getJarEncouragement } from '../../src/lib/encouragement';

export default function JarScreen() {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const todayEntries = useJarStore((s) => s.todayEntries);
  const todayCount = useJarStore((s) => s.todayCount());
  const activeTheme = useThemeStore((s) => s.theme);
  const encouragementEnabled = useSettingsStore(
    (s) => s.settings.dailyEncouragementEnabled
  );

  const encouragementContext =
    todayCount === 0 ? 'jarEmpty'
      : todayCount < 3 ? 'jarFilling'
        : 'jarFull';

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>today's jar</Text>
          <Text style={styles.subtitle}>
            {todayCount === 0
              ? 'complete tasks to fill it up'
              : `${todayCount} ${todayCount === 1 ? 'task' : 'tasks'} completed`}
          </Text>
        </View>

        {/* Jar */}
        <View style={styles.jarWrap}>
          <JarView
            entries={todayEntries}
            jarDesign={activeTheme.jarDesign}
            label="today"
          />
        </View>

        {/* Encouragement */}
        {encouragementEnabled && (
          <View style={styles.encouragementWrap}>
            <DailyEncouragement context={encouragementContext} />
          </View>
        )}

        {/* Progress summary */}
        {todayCount > 0 && (
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>completed today</Text>
              <Text style={styles.summaryValue}>{todayCount}</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceAlt }]}>
              <View style={[
                styles.progressFill,
                {
                  width: `${Math.min((todayCount / 10) * 100, 100)}%` as any,
                  backgroundColor: theme.colors.primary,
                },
              ]} />
            </View>
            <Text style={styles.progressHint}>
              {todayCount >= 10 ? 'jar full ✦' : `${10 - todayCount} more to fill the jar`}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(theme: import('../../src/types').Theme) {
  return StyleSheet.create({
    root: { flex: 1 },
    scroll: {
      paddingBottom: spacing.xxxl,
      gap: spacing.xl,
    },
    header: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      gap: spacing.xs,
    },
    title: {
      fontSize: typography.size.xxl,
      fontWeight: typography.weight.medium,
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: typography.size.sm,
      color: theme.colors.textMuted,
    },
    jarWrap: {
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    encouragementWrap: {
      marginHorizontal: spacing.xl,
    },
    summary: {
      marginHorizontal: spacing.xl,
      backgroundColor: theme.colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.taskCardBorder,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: typography.size.sm,
      color: theme.colors.textMuted,
    },
    summaryValue: {
      fontSize: typography.size.lg,
      fontWeight: typography.weight.medium,
      color: theme.colors.primary,
    },
    progressBar: {
      height: 6,
      borderRadius: radius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: 6,
      borderRadius: radius.full,
    },
    progressHint: {
      fontSize: typography.size.xs,
      color: theme.colors.textSubtle,
      textAlign: 'right',
    },
  });
}
