import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import type { Task, Priority } from '../../src/types';
import { useTaskStore } from '../../src/stores/taskStore';
import { useJarStore } from '../../src/stores/jarStore';
import { useTheme } from '../../src/theme';
import { useThemedStyles } from '../../src/theme/useThemedStyles';
import { spacing, typography } from '../../src/theme/tokens';
import { TaskCard } from '../../src/components/task/TaskCard';
import { TaskInput } from '../../src/components/task/TaskInput';
import { friendlyDateLabel, todayKey } from '../../src/lib/dateUtils';
import { useAnimationOverlay } from '../../src/components/AnimationOverlayProvider';
import { useThemeStore } from '../../src/stores/themeStore';
import { Dimensions } from 'react-native';

const SHAPE_GLYPH: Record<string, string> = {
  star: '✦', heart: '♥', cloud: '☁', sparkle: '✿',
};

export default function TodayScreen() {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const todayTasks = useTaskStore((s) => s.todayTasks());
  const completedCount = useTaskStore((s) => s.completedTodayCount());
  const addTask = useTaskStore((s) => s.addTask);
  const completeTask = useTaskStore((s) => s.completeTask);
  const postponeTask = useTaskStore((s) => s.postponeTask);
  const addJarEntry = useJarStore((s) => s.addEntry);
  const activeTheme = useThemeStore((s) => s.theme);
  const { fireParticle } = useAnimationOverlay();

  const { width, height } = Dimensions.get('window');
  // Jar tab is 2nd of 4 → ~37.5% across, near bottom
  const jarTabX = width * 0.375;
  const jarTabY = height - 40;

  // Map of taskId → ref for position measurement
  const cardRefs = useRef<Map<string, View>>(new Map());

  const handleAdd = useCallback((title: string, priority: Priority) => {
    addTask({ title, priority });
  }, [addTask]);

  const handleComplete = useCallback((id: string) => {
    const ref = cardRefs.current.get(id);

    // Fire particle from card position
    if (ref) {
      ref.measureInWindow((x, y, w, h) => {
        fireParticle({
          fromX: x + w / 2,
          fromY: y + h / 2,
          toX: jarTabX,
          toY: jarTabY,
          shape: SHAPE_GLYPH[activeTheme.particleShape] ?? '✦',
          color: activeTheme.colors.primary,
        });
      });
    } else {
      fireParticle({
        fromX: width / 2,
        fromY: height / 2,
        toX: jarTabX,
        toY: jarTabY,
        shape: SHAPE_GLYPH[activeTheme.particleShape] ?? '✦',
        color: activeTheme.colors.primary,
      });
    }

    // Update stores
    const completed = completeTask(id);
    if (completed) addJarEntry(completed.id, completed.title);
    cardRefs.current.delete(id);
  }, [completeTask, addJarEntry, fireParticle, activeTheme, jarTabX, jarTabY]);

  const handlePostpone = useCallback((id: string) => {
    postponeTask(id);
  }, [postponeTask]);

  const handlePressTask = useCallback((id: string) => {
    router.push({ pathname: '/task/[id]', params: { id } });
  }, []);

  const renderTask: ListRenderItem<Task> = useCallback(({ item }) => (
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

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={styles.dateLabel}>{friendlyDateLabel(todayKey())}</Text>
        <Text style={styles.title}>your tasks</Text>
        {completedCount > 0 && (
          <Text style={styles.completedCount}>
            {completedCount} {completedCount === 1 ? 'star' : 'stars'} collected ✦
          </Text>
        )}
      </View>

      <FlatList
        data={todayTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌙</Text>
            <Text style={styles.emptyText}>no tasks yet</Text>
            <Text style={styles.emptySubtext}>add something small below</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <TaskInput onAdd={handleAdd} />
    </SafeAreaView>
  );
}

function makeStyles(theme: import('../../src/types').Theme) {
  return StyleSheet.create({
    root: { flex: 1 },
    header: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      gap: spacing.xs,
    },
    dateLabel: {
      fontSize: typography.size.sm,
      color: theme.colors.textMuted,
      fontWeight: typography.weight.medium,
      textTransform: 'lowercase',
    },
    title: {
      fontSize: typography.size.xxl,
      fontWeight: typography.weight.medium,
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    completedCount: {
      fontSize: typography.size.sm,
      color: theme.colors.primary,
    },
    list: {
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
      flexGrow: 1,
    },
    empty: {
      flex: 1,
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
    },
  });
}
