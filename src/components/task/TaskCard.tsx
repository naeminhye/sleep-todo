import React, { useCallback, forwardRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

import type { Task } from '../../types';
import { useTheme } from '../../theme';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { spacing, radius, typography, cardShadow } from '../../theme/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onPostpone: (id: string) => void;
  onPress: (id: string) => void;
}

const PRIORITY_COLOR = {
  low:    '#6ee7b7',
  medium: '#fcd34d',
  high:   '#fca5a5',
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export const TaskCard = forwardRef<View, TaskCardProps>(
  function TaskCard({ task, onComplete, onPostpone, onPress }, ref) {
    const { theme } = useTheme();
    const styles = useThemedStyles(makeStyles);

    const scale   = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const handleComplete = useCallback(() => {
      scale.value = withSpring(0.92, { damping: 15 }, () => {
        opacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(onComplete)(task.id);
        });
      });
    }, [task.id, onComplete]);

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.97, { damping: 20 });
    }, []);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, { damping: 20 });
    }, []);

    return (
      <Animated.View style={[styles.wrapper, animatedStyle]}>
        {/* ref lives on the inner View so measureInWindow works correctly */}
        <View ref={ref} collapsable={false}>
          <Pressable
            style={styles.card}
            onPress={() => onPress(task.id)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            {/* Complete button */}
            <Pressable style={styles.checkWrap} onPress={handleComplete} hitSlop={8}>
              <View style={styles.check}>
                <View style={[
                  styles.checkInner,
                  { backgroundColor: theme.colors.primary + '30' },
                ]} />
              </View>
            </Pressable>

            {/* Task content */}
            <View style={styles.content}>
              <Text style={styles.title} numberOfLines={2}>{task.title}</Text>
              <View style={styles.meta}>
                {task.dueTime && (
                  <Text style={styles.metaText}>⏰ {task.dueTime}</Text>
                )}
                {task.category && (
                  <Text style={styles.metaText}>#{task.category}</Text>
                )}
              </View>
            </View>

            {/* Priority dot + postpone */}
            <View style={styles.right}>
              <View style={[
                styles.priorityDot,
                { backgroundColor: PRIORITY_COLOR[task.priority] },
              ]} />
              <Pressable
                onPress={() => onPostpone(task.id)}
                hitSlop={8}
                style={styles.postponeBtn}
              >
                <Text style={styles.postponeLabel}>later</Text>
              </Pressable>
            </View>
          </Pressable>
        </View>
      </Animated.View>
    );
  }
);

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(theme: import('../../types').Theme) {
  return StyleSheet.create({
    wrapper: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.taskCard,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.taskCardBorder,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
      ...cardShadow(theme.colors.primary),
    },
    checkWrap: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    check: {
      width: 22,
      height: 22,
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    checkInner: {
      width: 12,
      height: 12,
      borderRadius: radius.full,
    },
    content: {
      flex: 1,
      gap: spacing.xs,
    },
    title: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.regular,
      color: theme.colors.text,
      lineHeight: typography.size.md * typography.lineHeight.normal,
    },
    meta: {
      flexDirection: 'row',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    metaText: {
      fontSize: typography.size.xs,
      color: theme.colors.textMuted,
    },
    right: {
      alignItems: 'flex-end',
      gap: spacing.xs,
    },
    priorityDot: {
      width: 7,
      height: 7,
      borderRadius: radius.full,
    },
    postponeBtn: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
      backgroundColor: theme.colors.surfaceAlt,
    },
    postponeLabel: {
      fontSize: typography.size.xs,
      color: theme.colors.textMuted,
      fontWeight: typography.weight.medium,
    },
  });
}
