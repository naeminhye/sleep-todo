import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useJarStore } from '../../src/stores/jarStore';
import { useTheme } from '../../src/theme';
import { useThemedStyles } from '../../src/theme/useThemedStyles';
import { spacing, typography, radius } from '../../src/theme/tokens';
import { StarParticle } from '../../src/components/jar/StarParticle';
import { friendlyDateLabel, sortedDateKeys } from '../../src/lib/dateUtils';
import type { JarEntry } from '../../src/types';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const todayEntries = useJarStore((s) => s.todayEntries);
  const history = useJarStore((s) => s.history);
  const dates = useMemo(() => sortedDateKeys(history), [history]);

  const totalEver = useMemo(
    () =>
      todayEntries.length +
      Object.values(history).reduce((sum, r) => sum + r.totalCompleted, 0),
    [todayEntries, history]
  );

  const hasAnything = todayEntries.length > 0 || dates.length > 0;

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
          <Text style={styles.title}>history</Text>
          {totalEver > 0 && (
            <Text style={styles.subtitle}>
              {totalEver} {totalEver === 1 ? 'star' : 'stars'} collected in total
            </Text>
          )}
        </View>

        {/* Empty state */}
        {!hasAnything && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌙</Text>
            <Text style={styles.emptyText}>no history yet</Text>
            <Text style={styles.emptySubtext}>
              completed tasks will appear here day by day
            </Text>
          </View>
        )}

        {/* Today — live from jarStore.todayEntries */}
        {todayEntries.length > 0 && (
          <DayCard
            label="Today"
            entries={todayEntries}
            styles={styles}
            theme={theme}
            isToday
          />
        )}

        {/* Past days from archive */}
        {dates.map((date) => {
          const record = history[date];
          if (!record) return null;
          return (
            <DayCard
              key={date}
              label={friendlyDateLabel(date)}
              entries={record.entries}
              styles={styles}
              theme={theme}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── DayCard ──────────────────────────────────────────────────────────────────

function DayCard({
  label,
  entries,
  styles,
  theme,
  isToday = false,
}: {
  label: string;
  entries: JarEntry[];
  styles: ReturnType<typeof makeStyles>;
  theme: import('../../src/types').Theme;
  isToday?: boolean;
}) {
  return (
    <View style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <View style={styles.dayLabelRow}>
          <Text style={styles.dayLabel}>{label}</Text>
          {isToday && (
            <View style={[styles.liveDot, { backgroundColor: theme.colors.primary }]} />
          )}
        </View>
        <View style={[styles.dayBadge, { backgroundColor: theme.colors.primary + '20' }]}>
          <Text style={[styles.dayBadgeText, { color: theme.colors.primary }]}>
            {entries.length} ✦
          </Text>
        </View>
      </View>

      {/* Particle row */}
      <View style={styles.particleRow}>
        {entries.slice(0, 16).map((entry, i) => (
          <StarParticle
            key={entry.taskId}
            shape={entry.shape}
            index={i}
            size={18}
          />
        ))}
        {entries.length > 16 && (
          <Text style={styles.overflow}>+{entries.length - 16}</Text>
        )}
      </View>

      {/* Task title list */}
      <View style={styles.taskList}>
        {entries.slice(0, 5).map((entry) => (
          <View key={entry.taskId} style={styles.taskRow}>
            <Text style={styles.taskDot}>·</Text>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {entry.title}
            </Text>
          </View>
        ))}
        {entries.length > 5 && (
          <Text style={styles.moreLabel}>+{entries.length - 5} more</Text>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(theme: import('../../src/types').Theme) {
  return StyleSheet.create({
    root: { flex: 1 },
    scroll: { paddingBottom: spacing.xxxl, gap: spacing.lg },
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
      color: theme.colors.primary,
    },
    empty: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: spacing.xxxl,
      gap: spacing.sm,
    },
    emptyEmoji: { fontSize: 48 },
    emptyText: {
      fontSize: typography.size.lg,
      color: theme.colors.textMuted,
      fontWeight: typography.weight.medium,
    },
    emptySubtext: {
      fontSize: typography.size.sm,
      color: theme.colors.textSubtle,
      textAlign: 'center',
      paddingHorizontal: spacing.xl,
    },
    dayCard: {
      marginHorizontal: spacing.xl,
      backgroundColor: theme.colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.taskCardBorder,
      padding: spacing.lg,
      gap: spacing.md,
    },
    dayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dayLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    dayLabel: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.medium,
      color: theme.colors.text,
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: radius.full,
    },
    dayBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.full,
    },
    dayBadgeText: {
      fontSize: typography.size.xs,
      fontWeight: typography.weight.medium,
    },
    particleRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    overflow: {
      fontSize: typography.size.sm,
      color: theme.colors.textMuted,
      alignSelf: 'center',
    },
    taskList: {
      gap: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: theme.colors.taskCardBorder,
      paddingTop: spacing.sm,
    },
    taskRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    taskDot: {
      fontSize: typography.size.md,
      color: theme.colors.primary,
      lineHeight: typography.size.md * 1.5,
    },
    taskTitle: {
      flex: 1,
      fontSize: typography.size.sm,
      color: theme.colors.textMuted,
      lineHeight: typography.size.sm * 1.5,
    },
    moreLabel: {
      fontSize: typography.size.xs,
      color: theme.colors.textSubtle,
      paddingLeft: spacing.lg,
    },
  });
}
