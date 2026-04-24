import React, { useCallback, useRef } from 'react';
import {
  View, Text, SectionList, StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import type { Task } from '../../src/types';
import { useTaskStore } from '../../src/stores/taskStore';
import { useJarStore } from '../../src/stores/jarStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useThemeStore } from '../../src/stores/themeStore';
import { useTheme } from '../../src/theme';
import { useThemedStyles } from '../../src/theme/useThemedStyles';
import { spacing, typography, radius, fonts } from '../../src/theme/tokens';
import { TaskCard } from '../../src/components/task/TaskCard';
import { TaskInput } from '../../src/components/task/TaskInput';
import { useAnimationOverlay } from '../../src/components/AnimationOverlayProvider';
import { friendlyDayOfWeek, friendlyMonthDay } from '../../src/lib/dateUtils';
import { Dimensions } from 'react-native';

const SHAPE_GLYPH: Record<string, string> = {
  star: '✦', heart: '♥', cloud: '☁', moon: '◑',
};

export default function TodayScreen() {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const todayActive = useTaskStore((s) => s.todayActive());
  const todayDone = useTaskStore((s) => s.todayDone());
  const completedCount = useTaskStore((s) => s.completedTodayCount());
  const totalToday = todayActive.length + todayDone.length;
  const addTask = useTaskStore((s) => s.addTask);
  const completeTask = useTaskStore((s) => s.completeTask);
  const postponeTask = useTaskStore((s) => s.postponeTask);
  const addJarEntry = useJarStore((s) => s.addEntry);
  const activeTheme = useThemeStore((s) => s.theme);
  const userName = useSettingsStore((s) => s.settings.userName);
  const { fireParticle } = useAnimationOverlay();

  const { width, height } = Dimensions.get('window');
  const jarTabX = width * 0.375;
  const jarTabY = height - 40;

  const cardRefs = useRef<Map<string, View>>(new Map());

  const handleComplete = useCallback((id: string) => {
    const ref = cardRefs.current.get(id);
    const shoot = (fromX: number, fromY: number) => {
      fireParticle({
        fromX, fromY,
        toX: jarTabX, toY: jarTabY,
        shape: SHAPE_GLYPH[activeTheme.particleShape] ?? '✦',
        color: activeTheme.colors.accent,
      });
    };

    if (ref) {
      ref.measureInWindow((x, y, w, h) => shoot(x + w / 2, y + h / 2));
    } else {
      shoot(width / 2, height / 2);
    }

    const completed = completeTask(id);
    if (completed) {
      addJarEntry(completed.id, completed.title);
      const newCount = completedCount + 1;
      router.push({
        pathname: '/complete',
        params: {
          taskId: completed.id,
          title: completed.title,
          count: String(newCount),
          total: String(totalToday),
        },
      });
    }
    cardRefs.current.delete(id);
  }, [completeTask, addJarEntry, fireParticle, activeTheme, completedCount, totalToday]);

  const handlePostpone = useCallback((id: string) => postponeTask(id), [postponeTask]);
  const handlePressTask = useCallback((id: string) => {
    router.push({ pathname: '/task/[id]', params: { id } });
  }, []);

  const renderTask = useCallback(({ item }: { item: Task }) => (
    <TaskCard
      ref={(r) => {
        if (r) cardRefs.current.set(item.id, r);
        else cardRefs.current.delete(item.id);
      }}
      task={item}
      onComplete={handleComplete}
      onPostpone={handlePostpone}
      onPress={handlePressTask}
    />
  ), [handleComplete, handlePostpone, handlePressTask]);

  const sections = [
    ...(todayActive.length > 0 ? [{ title: 'to do ↓', data: todayActive, isDone: false }] : []),
    ...(todayDone.length > 0 ? [{ title: 'done · nice work ♡', data: todayDone, isDone: true }] : []),
  ];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.sectionTitle,
              section.isDone && { color: theme.colors.done },
            ]}>
              {section.title}
            </Text>
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Date */}
            <Text style={styles.dateLabel}>
              {friendlyDayOfWeek()} · {friendlyMonthDay()}
            </Text>
            {/* Greeting */}
            <Text style={styles.greeting}>
              hi, {userName || 'friend'}
            </Text>
            {/* Progress */}
            {totalToday > 0 && (
              <Text style={styles.progress}>
                {completedCount} of {totalToday} little things done
                {todayActive.length > 0 ? ` · ${todayActive.length} to go` : ' · all done ✦'}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>zz</Text>
            <Text style={styles.emptyText}>nothing here yet</Text>
            <Text style={styles.emptySubtext}>add a little thing below</Text>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />

      {/* Focus mode button */}
      {todayActive.length > 0 && (
        <Pressable
          style={[styles.focusBtn, { borderColor: theme.colors.primary + '60' }]}
          onPress={() => router.push('/focus')}
        >
          <Text style={[styles.focusLabel, { color: theme.colors.primary }]}>
            ✦ just this one
          </Text>
        </Pressable>
      )}

      {/* End of day button */}
      {completedCount > 0 && (
        <Pressable
          style={[styles.eodBtn, { borderColor: theme.colors.taskCardBorder }]}
          onPress={() => router.push('/endofday')}
        >
          <Text style={[styles.eodLabel, { color: theme.colors.textMuted }]}>
            that's enough for today zzz
          </Text>
        </Pressable>
      )}

      <TaskInput onAdd={(title, weight, schedule) => { addTask({ title, weight, schedule }); }} />
    </SafeAreaView>
  );
}

function makeStyles(theme: import('../../src/types').Theme) {
  return StyleSheet.create({
    root: { flex: 1 },
    list: { paddingBottom: 160, flexGrow: 1 },
    header: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      gap: spacing.xs,
    },
    dateLabel: {
      fontSize: typography.size.sm,
      color: theme.colors.textMuted,
      fontFamily: fonts.regular,
    },
    greeting: {
      fontSize: typography.size.xxxl,
      color: theme.colors.text,
      fontFamily: fonts.display,
      lineHeight: 40,
    },
    progress: {
      fontSize: typography.size.sm,
      color: theme.colors.textMuted,
      fontFamily: fonts.regular,
    },
    sectionHeader: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },
    sectionTitle: {
      fontSize: typography.size.sm,
      color: theme.colors.textMuted,
      fontFamily: fonts.medium,
    },
    empty: {
      alignItems: 'center', paddingTop: spacing.xxxl, gap: spacing.sm,
    },
    emptyEmoji: { fontSize: 32, color: theme.colors.textSubtle },
    emptyText: {
      fontSize: typography.size.lg, color: theme.colors.textMuted,
      fontFamily: fonts.medium,
    },
    emptySubtext: {
      fontSize: typography.size.sm, color: theme.colors.textSubtle,
      fontFamily: fonts.regular,
    },
    focusBtn: {
      marginHorizontal: spacing.xl,
      marginBottom: spacing.xs,
      borderRadius: radius.full,
      borderWidth: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    focusLabel: { fontSize: typography.size.sm, fontFamily: fonts.medium },
    eodBtn: {
      marginHorizontal: spacing.xl, marginBottom: spacing.sm,
      borderRadius: radius.full, borderWidth: 1,
      paddingVertical: spacing.sm, alignItems: 'center',
    },
    eodLabel: { fontSize: typography.size.sm, fontFamily: fonts.regular },
  });
}