import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { useTaskStore } from '../../src/stores/taskStore';
import { useJarStore } from '../../src/stores/jarStore';
import { useTheme } from '../../src/theme';
import { useThemedStyles } from '../../src/theme/useThemedStyles';
import { spacing, typography, radius } from '../../src/theme/tokens';
import type { Priority } from '../../src/types';

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low',    label: 'low',  color: '#6ee7b7' },
  { value: 'medium', label: 'mid',  color: '#fcd34d' },
  { value: 'high',   label: 'high', color: '#fca5a5' },
];

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const tasks      = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const completeTask = useTaskStore((s) => s.completeTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const addJarEntry = useJarStore((s) => s.addEntry);

  const task = tasks.find((t) => t.id === id);

  const [title, setTitle]       = useState(task?.title ?? '');
  const [note, setNote]         = useState(task?.note ?? '');
  const [category, setCategory] = useState(task?.category ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [edited, setEdited]     = useState(false);

  useEffect(() => {
    setEdited(
      title !== (task?.title ?? '') ||
      note !== (task?.note ?? '') ||
      category !== (task?.category ?? '') ||
      priority !== (task?.priority ?? 'medium')
    );
  }, [title, note, category, priority, task]);

  if (!task) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.surface }]}>
        <Text style={styles.notFound}>Task not found</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnLabel}>close</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    updateTask(id, { title, note: note || undefined, category: category || undefined, priority });
    router.back();
  };

  const handleComplete = () => {
    const completed = completeTask(id);
    if (completed) addJarEntry(completed.id, completed.title);
    router.back();
  };

  const handleDelete = () => {
    deleteTask(id);
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: theme.colors.surface }]}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.backLabel}>cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>task</Text>
        {edited ? (
          <Pressable onPress={handleSave} hitSlop={8}>
            <Text style={[styles.saveLabel, { color: theme.colors.primary }]}>save</Text>
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>title</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="task title"
            placeholderTextColor={theme.colors.textSubtle}
            multiline
          />
        </View>

        {/* Note */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>note</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="add a note..."
            placeholderTextColor={theme.colors.textSubtle}
            multiline
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>category</Text>
          <TextInput
            style={styles.inlineInput}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. work, personal"
            placeholderTextColor={theme.colors.textSubtle}
          />
        </View>

        {/* Priority */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>priority</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map((p) => {
              const isActive = priority === p.value;
              return (
                <Pressable
                  key={p.value}
                  style={[
                    styles.priorityChip,
                    isActive && {
                      backgroundColor: p.color + '25',
                      borderColor: p.color,
                    },
                  ]}
                  onPress={() => setPriority(p.value)}
                >
                  <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                  <Text style={[
                    styles.priorityLabel,
                    isActive && { color: theme.colors.text },
                  ]}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Status badge */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>status</Text>
          <View style={[styles.statusBadge, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Text style={[styles.statusText, { color: theme.colors.textMuted }]}>
              {task.status}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={[styles.actions, { borderTopColor: theme.colors.taskCardBorder }]}>
        {task.status !== 'completed' && (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleComplete}
          >
            <Text style={styles.actionBtnLabel}>mark complete ✦</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.deleteBtn, { borderColor: theme.colors.taskCardBorder }]}
          onPress={handleDelete}
        >
          <Text style={[styles.deleteBtnLabel, { color: theme.colors.textMuted }]}>
            delete task
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(theme: import('../../src/types').Theme) {
  return StyleSheet.create({
    root: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.taskCardBorder,
    },
    headerTitle: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.medium,
      color: theme.colors.text,
    },
    headerSpacer: { width: 40 },
    backLabel: {
      fontSize: typography.size.md,
      color: theme.colors.textMuted,
    },
    saveLabel: {
      fontSize: typography.size.md,
      fontWeight: typography.weight.medium,
    },
    scroll: {
      padding: spacing.xl,
      gap: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    field: { gap: spacing.sm },
    fieldLabel: {
      fontSize: typography.size.xs,
      color: theme.colors.textSubtle,
      fontWeight: typography.weight.medium,
      letterSpacing: 0.5,
    },
    titleInput: {
      fontSize: typography.size.lg,
      color: theme.colors.text,
      fontWeight: typography.weight.medium,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.taskCardBorder,
      paddingVertical: spacing.sm,
      minHeight: 44,
    },
    noteInput: {
      fontSize: typography.size.md,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.taskCardBorder,
      borderRadius: radius.md,
      padding: spacing.md,
      minHeight: 88,
      textAlignVertical: 'top',
    },
    inlineInput: {
      fontSize: typography.size.md,
      color: theme.colors.text,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.taskCardBorder,
      paddingVertical: spacing.sm,
    },
    priorityRow: { flexDirection: 'row', gap: spacing.sm },
    priorityChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: theme.colors.taskCardBorder,
    },
    priorityDot: { width: 7, height: 7, borderRadius: radius.full },
    priorityLabel: {
      fontSize: typography.size.sm,
      color: theme.colors.textMuted,
      fontWeight: typography.weight.medium,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.full,
    },
    statusText: { fontSize: typography.size.sm },
    actions: {
      padding: spacing.lg,
      gap: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    actionBtn: {
      borderRadius: radius.full,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    actionBtnLabel: {
      fontSize: typography.size.md,
      color: '#ffffff',
      fontWeight: typography.weight.medium,
    },
    deleteBtn: {
      borderRadius: radius.full,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
    },
    deleteBtnLabel: { fontSize: typography.size.md },
    notFound: {
      fontSize: typography.size.md,
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.xxxl,
    },
    closeBtn: { alignSelf: 'center', marginTop: spacing.lg },
    closeBtnLabel: { fontSize: typography.size.md, color: theme.colors.primary },
  });
}
