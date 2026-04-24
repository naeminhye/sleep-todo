import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useJarStore } from '../../src/stores/jarStore';
import { useTheme } from '../../src/theme';
import { useThemedStyles } from '../../src/theme/useThemedStyles';
import { spacing, typography, radius, fonts } from '../../src/theme/tokens';
import {
  todayKey, sortedDateKeys, friendlyDateLabel,
  getDaysInMonth, getFirstDayOfMonth,
} from '../../src/lib/dateUtils';
import type { JarEntry } from '../../src/types';

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];
const DAY_LABELS = ['m', 't', 'w', 't', 'f', 's', 's'];

export default function HistoryScreen() {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const todayEntries = useJarStore((s) => s.todayEntries);
  const history = useJarStore((s) => s.history);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1); // 1-based

  // Build a map of date → count for current month
  const monthCounts = useMemo(() => {
    const map: Record<string, number> = {};
    const today = todayKey();
    // Past history
    Object.entries(history).forEach(([date, record]) => {
      if (date.startsWith(`${viewYear}-${String(viewMonth).padStart(2, '0')}`)) {
        map[date] = record.totalCompleted;
      }
    });
    // Today's live entries
    if (today.startsWith(`${viewYear}-${String(viewMonth).padStart(2, '0')}`)) {
      map[today] = (map[today] ?? 0) + todayEntries.length;
    }
    return map;
  }, [history, todayEntries, viewYear, viewMonth]);

  const totalMonth = Object.values(monthCounts).reduce((s, n) => s + n, 0);
  const activeDays = Object.keys(monthCounts).length;

  const firstDay = getFirstDayOfMonth(viewYear, viewMonth); // 0=Sun
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  // Shift so week starts Monday: Sun(0)→6, Mon(1)→0, ...
  const startOffset = (firstDay + 6) % 7;

  // Recent days list
  const recentDates = useMemo(() => {
    const today = todayKey();
    const dates: string[] = [];
    if (todayEntries.length > 0) dates.push(today);
    sortedDateKeys(history).forEach((d) => { if (!dates.includes(d)) dates.push(d); });
    return dates.slice(0, 7);
  }, [history, todayEntries]);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  };

  const today = todayKey();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>your quiet month</Text>
          <Text style={styles.subtitle}>
            {MONTH_NAMES[viewMonth - 1]}
          </Text>
          {(totalMonth > 0 || activeDays > 0) && (
            <Text style={styles.monthStats}>
              {totalMonth} little {totalMonth === 1 ? 'win' : 'wins'} · {activeDays} gentle {activeDays === 1 ? 'day' : 'days'} ♡
            </Text>
          )}
        </View>

        {/* Month nav */}
        <View style={styles.monthNav}>
          <Pressable onPress={prevMonth} style={styles.navBtn}>
            <Text style={styles.navArrow}>←</Text>
          </Pressable>
          <Text style={styles.monthLabel}>
            {MONTH_NAMES[viewMonth - 1]} {viewYear}
          </Text>
          <Pressable onPress={nextMonth} style={styles.navBtn}>
            <Text style={styles.navArrow}>→</Text>
          </Pressable>
        </View>

        {/* Calendar grid */}
        <View style={styles.calendar}>
          {/* Day headers */}
          <View style={styles.calRow}>
            {DAY_LABELS.map((d, i) => (
              <Text key={i} style={styles.dayHeader}>{d}</Text>
            ))}
          </View>

          {/* Day cells */}
          {(() => {
            const cells = [];
            // Empty cells before first day
            for (let i = 0; i < startOffset; i++) {
              cells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
            }
            for (let d = 1; d <= daysInMonth; d++) {
              const dateKey = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const count = monthCounts[dateKey] ?? 0;
              const isToday = dateKey === today;
              cells.push(
                <View
                  key={dateKey}
                  style={[
                    styles.dayCell,
                    count > 0 && { backgroundColor: theme.colors.primary + (count >= 5 ? '40' : count >= 3 ? '28' : '18') },
                    isToday && styles.dayCellToday,
                  ]}
                >
                  <Text style={[
                    styles.dayNum,
                    count > 0 && { color: theme.colors.primary },
                    isToday && { color: theme.colors.primary, fontFamily: fonts.medium },
                  ]}>
                    {d}
                  </Text>
                  {count > 0 && (
                    <Text style={[styles.dayCount, { color: theme.colors.primary }]}>
                      {count}
                    </Text>
                  )}
                </View>
              );
            }
            return (
              <View style={styles.calGrid}>
                {cells.map((cell, i) => (
                  <View key={i} style={styles.calCellWrap}>{cell}</View>
                ))}
              </View>
            );
          })()}
        </View>

        {/* Recent section */}
        {recentDates.length > 0 && (
          <View style={styles.recent}>
            <Text style={styles.recentLabel}>recently ↓</Text>
            {recentDates.map((date) => {
              const isToday = date === today;
              const entries: JarEntry[] = isToday
                ? todayEntries
                : (history[date]?.entries ?? []);
              const count = entries.length;
              if (count === 0) return null;
              return (
                <View key={date} style={styles.recentCard}>
                  <View style={styles.recentHeader}>
                    <Text style={styles.recentDate}>{friendlyDateLabel(date)}</Text>
                    <Text style={styles.recentStars}>{'★'.repeat(Math.min(count, 5))}</Text>
                    <Text style={styles.recentCount}>{count}/5</Text>
                  </View>
                  <View style={styles.recentTasks}>
                    {entries.slice(0, 4).map((entry) => (
                      <Text key={entry.taskId} style={styles.recentTask} numberOfLines={1}>
                        {entry.title}
                      </Text>
                    ))}
                    {count > 4 && (
                      <Text style={styles.recentMore}>+{count - 4} more</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty state */}
        {recentDates.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌙</Text>
            <Text style={styles.emptyText}>no history yet</Text>
            <Text style={styles.emptySubtext}>completed tasks will collect here</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(theme: import('../../src/types').Theme) {
  return StyleSheet.create({
    root: { flex: 1 },
    scroll: { paddingBottom: spacing.xxxl, gap: spacing.lg },
    header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.xs },
    title: {
      fontSize: typography.size.xxl, color: theme.colors.text,
      fontFamily: fonts.display, letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: typography.size.xl, color: theme.colors.primary,
      fontFamily: fonts.display,
    },
    monthStats: {
      fontSize: typography.size.sm, color: theme.colors.textMuted,
      fontFamily: fonts.regular,
    },
    monthNav: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
    },
    navBtn: { padding: spacing.sm },
    navArrow: { fontSize: typography.size.lg, color: theme.colors.primary },
    monthLabel: {
      fontSize: typography.size.md, color: theme.colors.text,
      fontFamily: fonts.medium,
    },
    calendar: { paddingHorizontal: spacing.lg, gap: spacing.sm },
    calRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.xs },
    dayHeader: {
      fontSize: typography.size.xs, color: theme.colors.textSubtle,
      fontFamily: fonts.regular, width: 32, textAlign: 'center',
    },
    calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    calCellWrap: { width: `${100 / 7}%` as any, aspectRatio: 1, padding: 2 },
    dayCell: {
      flex: 1, borderRadius: radius.sm,
      alignItems: 'center', justifyContent: 'center',
      gap: 1,
    },
    dayCellToday: {
      borderWidth: 1, borderColor: theme.colors.primary,
    },
    dayNum: {
      fontSize: typography.size.xs,
      color: theme.colors.textSubtle,
      fontFamily: fonts.regular,
    },
    dayCount: {
      fontSize: 9, fontFamily: fonts.medium,
    },
    recent: { paddingHorizontal: spacing.xl, gap: spacing.md },
    recentLabel: {
      fontSize: typography.size.xs, color: theme.colors.textSubtle,
      fontFamily: fonts.medium, letterSpacing: 0.5,
    },
    recentCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: radius.lg, borderWidth: 1,
      borderColor: theme.colors.taskCardBorder,
      padding: spacing.lg, gap: spacing.sm,
    },
    recentHeader: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    },
    recentDate: {
      fontSize: typography.size.md, color: theme.colors.text,
      fontFamily: fonts.medium, flex: 1,
    },
    recentStars: { fontSize: typography.size.sm, color: theme.colors.accent },
    recentCount: {
      fontSize: typography.size.xs, color: theme.colors.textMuted,
      fontFamily: fonts.regular,
    },
    recentTasks: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    recentTask: {
      fontSize: typography.size.xs, color: theme.colors.textMuted,
      fontFamily: fonts.regular,
      backgroundColor: theme.colors.surfaceAlt,
      paddingHorizontal: spacing.sm, paddingVertical: 3,
      borderRadius: radius.full,
      overflow: 'hidden',
    },
    recentMore: {
      fontSize: typography.size.xs, color: theme.colors.textSubtle,
      fontFamily: fonts.regular,
    },
    empty: { alignItems: 'center', paddingTop: spacing.xxxl, gap: spacing.sm },
    emptyEmoji: { fontSize: 40 },
    emptyText: {
      fontSize: typography.size.lg, color: theme.colors.textMuted,
      fontFamily: fonts.medium,
    },
    emptySubtext: {
      fontSize: typography.size.sm, color: theme.colors.textSubtle,
      fontFamily: fonts.regular,
    },
  });
}