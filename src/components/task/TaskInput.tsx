import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { Priority } from '../../types';
import { useTheme } from '../../theme';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { spacing, radius, typography } from '../../theme/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaskInputProps {
  onAdd: (title: string, priority: Priority) => void;
}

// ─── Priority options ─────────────────────────────────────────────────────────

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low',    label: 'low',    color: '#6ee7b7' },
  { value: 'medium', label: 'mid',    color: '#fcd34d' },
  { value: 'high',   label: 'high',   color: '#fca5a5' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function TaskInput({ onAdd }: TaskInputProps) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const expandAnim = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const expandedStyle = useAnimatedStyle(() => ({
    maxHeight: withSpring(expanded ? 160 : 56, { damping: 18 }),
    opacity: withTiming(expanded ? 1 : 0.95, { duration: 150 }),
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleExpand = useCallback(() => {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, priority);
    setTitle('');
    setPriority('medium');
    setExpanded(false);
    Keyboard.dismiss();
  }, [title, priority, onAdd]);

  const handleCancel = useCallback(() => {
    setTitle('');
    setPriority('medium');
    setExpanded(false);
    Keyboard.dismiss();
  }, []);

  const handleAddPress = () => {
    buttonScale.value = withSpring(0.92, { damping: 15 }, () => {
      buttonScale.value = withSpring(1, { damping: 15 });
    });
    if (!expanded) {
      handleExpand();
    } else {
      handleSubmit();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <Animated.View style={[styles.container, expandedStyle]}>
        {/* Collapsed state — just a prompt row */}
        {!expanded && (
          <Pressable style={styles.collapsedRow} onPress={handleExpand}>
            <Text style={styles.placeholder}>+ add a tiny task...</Text>
          </Pressable>
        )}

        {/* Expanded state */}
        {expanded && (
          <View style={styles.expandedInner}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="what's the tiny task?"
              placeholderTextColor={theme.colors.textSubtle}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              autoFocus
            />

            {/* Priority row + actions */}
            <View style={styles.bottomRow}>
              <View style={styles.priorityRow}>
                {PRIORITIES.map((p) => (
                  <Pressable
                    key={p.value}
                    style={[
                      styles.priorityChip,
                      priority === p.value && {
                        backgroundColor: p.color + '30',
                        borderColor: p.color,
                      },
                    ]}
                    onPress={() => setPriority(p.value)}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                    <Text style={[
                      styles.priorityLabel,
                      priority === p.value && { color: theme.colors.text },
                    ]}>
                      {p.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.actions}>
                <Pressable onPress={handleCancel} style={styles.cancelBtn}>
                  <Text style={styles.cancelLabel}>cancel</Text>
                </Pressable>
                <Animated.View style={buttonStyle}>
                  <Pressable
                    onPress={handleSubmit}
                    style={[
                      styles.addBtn,
                      { backgroundColor: theme.colors.primary },
                      !title.trim() && { opacity: 0.4 },
                    ]}
                    disabled={!title.trim()}
                  >
                    <Text style={styles.addLabel}>add ✦</Text>
                  </Pressable>
                </Animated.View>
              </View>
            </View>
          </View>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    collapsedRow: {
      height: 56,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },
    placeholder: {
      fontSize: typography.size.md,
      color: theme.colors.textSubtle,
    },
    expandedInner: {
      padding: spacing.md,
      gap: spacing.md,
    },
    input: {
      fontSize: typography.size.md,
      color: theme.colors.text,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.taskCardBorder,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    priorityRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    priorityChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: theme.colors.taskCardBorder,
    },
    priorityDot: {
      width: 6,
      height: 6,
      borderRadius: radius.full,
    },
    priorityLabel: {
      fontSize: typography.size.xs,
      color: theme.colors.textMuted,
      fontWeight: typography.weight.medium,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    cancelBtn: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    cancelLabel: {
      fontSize: typography.size.sm,
      color: theme.colors.textMuted,
    },
    addBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
    },
    addLabel: {
      fontSize: typography.size.sm,
      color: '#ffffff',
      fontWeight: typography.weight.medium,
    },
  });
}
