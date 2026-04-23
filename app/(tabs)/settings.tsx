import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeStore, THEMES } from '../../src/stores/themeStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useTheme } from '../../src/theme';
import { useThemedStyles } from '../../src/theme/useThemedStyles';
import { spacing, typography, radius } from '../../src/theme/tokens';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const activeThemeId = useThemeStore((s) => s.activeThemeId);
  const setTheme = useThemeStore((s) => s.setTheme);
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const allThemes = Object.values(THEMES);

  const toggleEncouragement = useCallback(
    (val: boolean) => updateSettings({ dailyEncouragementEnabled: val }),
    [updateSettings]
  );
  const toggleNotifications = useCallback(
    (val: boolean) => updateSettings({ notificationsEnabled: val }),
    [updateSettings]
  );

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>settings</Text>
        </View>

        {/* ── Theme ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>theme</Text>
          <View style={styles.themeGrid}>
            {allThemes.map((t) => {
              const isActive = t.id === activeThemeId;
              return (
                <Pressable
                  key={t.id}
                  style={[
                    styles.themeCard,
                    { backgroundColor: t.colors.surface },
                    { borderColor: isActive ? t.colors.primary : t.colors.taskCardBorder },
                    isActive && styles.themeCardActive,
                  ]}
                  onPress={() => setTheme(t.id)}
                >
                  <View style={styles.swatchRow}>
                    <View style={[styles.swatch, { backgroundColor: t.colors.primary }]} />
                    <View style={[styles.swatch, { backgroundColor: t.colors.accent }]} />
                    <View style={[styles.swatch, { backgroundColor: t.colors.background }]} />
                  </View>
                  <Text style={[styles.themeName, { color: t.colors.text }]} numberOfLines={1}>
                    {t.name}
                  </Text>
                  {isActive && (
                    <Text style={[styles.themeActive, { color: t.colors.primary }]}>✦</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Preferences ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>preferences</Text>
          <View style={styles.card}>
            <SettingRow
              label="daily encouragement"
              description="show gentle messages in the jar"
              value={settings.dailyEncouragementEnabled}
              onToggle={toggleEncouragement}
            />
            <View style={styles.divider} />
            <SettingRow
              label="gentle reminders"
              description="soft nudges to check your tasks"
              value={settings.notificationsEnabled}
              onToggle={toggleNotifications}
            />
          </View>
        </View>

        {/* ── About ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>about</Text>
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>sleepy to-do</Text>
              <Text style={styles.aboutValue}>v1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>small tasks, gentle progress</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── SettingRow ───────────────────────────────────────────────────────────────

function SettingRow({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: theme.colors.surfaceAlt,
          true: theme.colors.primary + '80',
        }}
        thumbColor={value ? theme.colors.primary : theme.colors.textSubtle}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(theme: import('../../src/types').Theme) {
  return StyleSheet.create({
    root: { flex: 1 },
    scroll: { paddingBottom: spacing.xxxl, gap: spacing.xl },
    header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
    title: {
      fontSize: typography.size.xxl,
      fontWeight: typography.weight.medium,
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    section: { gap: spacing.sm, paddingHorizontal: spacing.xl },
    sectionLabel: {
      fontSize: typography.size.xs,
      color: theme.colors.textSubtle,
      fontWeight: typography.weight.medium,
      letterSpacing: 0.5,
    },
    themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    themeCard: {
      width: '47%' as any,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      padding: spacing.md,
      gap: spacing.xs,
    },
    themeCardActive: { borderWidth: 2 },
    swatchRow: { flexDirection: 'row', gap: spacing.xs },
    swatch: { width: 12, height: 12, borderRadius: radius.full },
    themeName: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
    themeActive: {
      fontSize: typography.size.xs,
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.taskCardBorder,
      overflow: 'hidden',
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.taskCardBorder,
      marginHorizontal: spacing.lg,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    settingText: { flex: 1, gap: 2 },
    settingLabel: { fontSize: typography.size.md, color: theme.colors.text },
    settingDesc: { fontSize: typography.size.xs, color: theme.colors.textMuted },
    aboutRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    aboutLabel: { fontSize: typography.size.sm, color: theme.colors.textMuted },
    aboutValue: { fontSize: typography.size.sm, color: theme.colors.textSubtle },
  });
}
