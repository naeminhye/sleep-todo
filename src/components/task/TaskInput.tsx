import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, Pressable,
  StyleSheet, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';

import type { TaskWeight, TaskSchedule } from '../../types';
import { useTheme } from '../../theme';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { spacing, radius, typography, fonts } from '../../theme/tokens';

interface TaskInputProps {
  onAdd: (title: string, weight: TaskWeight, schedule: TaskSchedule) => void;
}

const WEIGHTS: { value: TaskWeight; label: string }[] = [
  { value: 'tiny', label: 'tiny' },
  { value: 'medium', label: 'medium' },
  { value: 'big', label: 'big' },
];

const SCHEDULES: { value: TaskSchedule; label: string }[] = [
  { value: 'today', label: 'today' },
  { value: 'tomorrow', label: 'tomorrow' },
  { value: 'someday', label: 'someday' },
];

export function TaskInput({ onAdd }: TaskInputProps) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const [title, setTitle] = useState('');
  const [weight, setWeight] = useState<TaskWeight>('medium');
  const [schedule, setSchedule] = useState<TaskSchedule>('today');
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const containerStyle = useAnimatedStyle(() => ({
    maxHeight: withSpring(expanded ? 220 : 60, { damping: 18 }),
  }));

  const handleExpand = useCallback(() => {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, weight, schedule);
    setTitle('');
    setWeight('medium');
    setSchedule('today');
    setExpanded(false);
    Keyboard.dismiss();
  }, [title, weight, schedule, onAdd]);

  const handleCancel = useCallback(() => {
    setTitle('');
    setExpanded(false);
    Keyboard.dismiss();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <Animated.View style={[styles.container, containerStyle]}>
        {!expanded ? (
          <Pressable style={styles.collapsed} onPress={handleExpand}>
            <Text style={styles.collapsedIcon}>+</Text>
            <Text style={styles.collapsedLabel}>add a little thing</Text>
          </Pressable>
        ) : (
          <View style={styles.expanded}>
            {/* Input */}
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>✎</Text>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="new little thing..."
                placeholderTextColor={theme.colors.textSubtle}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                autoFocus
              />
            </View>

            {/* Schedule row */}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>when?</Text>
              <View style={styles.chips}>
                {SCHEDULES.map((s) => (
                  <Pressable
                    key={s.value}
                    style={[
                      styles.chip,
                      schedule === s.value && {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                      },
                    ]}
                    onPress={() => setSchedule(s.value)}
                  >
                    <Text style={[
                      styles.chipLabel,
                      schedule === s.value && { color: '#ffffff' },
                    ]}>
                      {s.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Weight row */}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>worth a...</Text>
              <View style={styles.chips}>
                {WEIGHTS.map((w) => (
                  <Pressable
                    key={w.value}
                    style={[
                      styles.chip,
                      weight === w.value && {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                      },
                    ]}
                    onPress={() => setWeight(w.value)}
                  >
                    <Text style={[
                      styles.chipLabel,
                      weight === w.value && { color: '#ffffff' },
                    ]}>
                      {w.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable onPress={handleCancel} style={styles.cancelBtn}>
                <Text style={styles.cancelLabel}>cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                style={[
                  styles.addBtn,
                  { backgroundColor: theme.colors.primary },
                  !title.trim() && { opacity: 0.4 },
                ]}
                disabled={!title.trim()}
              >
                <Text style={styles.addLabel}>tuck it in ♡</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(theme: import('../../types').Theme) {
  return StyleSheet.create({
    container: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.taskCardBorder,
      overflow: 'hidden',
    },
    collapsed: {
      height: 60, flexDirection: 'row',
      alignItems: 'center', paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    collapsedIcon: {
      fontSize: typography.size.xl,
      color: theme.colors.primary,
      fontFamily: fonts.regular,
    },
    collapsedLabel: {
      fontSize: typography.size.md,
      color: theme.colors.textSubtle,
      fontFamily: fonts.regular,
    },
    expanded: { padding: spacing.md, gap: spacing.sm },
    inputRow: {
      flexDirection: 'row', alignItems: 'center',
      gap: spacing.sm, paddingBottom: spacing.sm,
      borderBottomWidth: 1, borderBottomColor: theme.colors.taskCardBorder,
    },
    inputIcon: { fontSize: 16, color: theme.colors.textSubtle },
    input: {
      flex: 1, fontSize: typography.size.md,
      color: theme.colors.text, fontFamily: fonts.regular,
      paddingVertical: spacing.xs,
    },
    row: {
      flexDirection: 'row', alignItems: 'center',
      gap: spacing.md,
    },
    rowLabel: {
      fontSize: typography.size.xs,
      color: theme.colors.textMuted,
      fontFamily: fonts.regular,
      width: 60,
    },
    chips: { flexDirection: 'row', gap: spacing.xs, flex: 1 },
    chip: {
      paddingHorizontal: spacing.sm, paddingVertical: 4,
      borderRadius: radius.full, borderWidth: 1,
      borderColor: theme.colors.taskCardBorder,
    },
    chipLabel: {
      fontSize: typography.size.xs,
      color: theme.colors.textMuted,
      fontFamily: fonts.regular,
    },
    actions: {
      flexDirection: 'row', justifyContent: 'flex-end',
      alignItems: 'center', gap: spacing.sm,
      paddingTop: spacing.xs,
    },
    cancelBtn: { padding: spacing.sm },
    cancelLabel: {
      fontSize: typography.size.sm,
      color: theme.colors.textMuted,
      fontFamily: fonts.regular,
    },
    addBtn: {
      paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
      borderRadius: radius.full,
    },
    addLabel: {
      fontSize: typography.size.sm, color: '#ffffff',
      fontFamily: fonts.medium,
    },
  });
}