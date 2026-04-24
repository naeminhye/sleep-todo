import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, Switch, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeStore, THEMES } from '../../src/stores/themeStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useTheme } from '../../src/theme';
import { useThemedStyles } from '../../src/theme/useThemedStyles';
import { spacing, typography, radius, fonts } from '../../src/theme/tokens';
import type { ParticleShape } from '../../src/types';

const THEME_ORDER = ['dreamyDusk', 'strawberryDream', 'cloudyMeadow', 'cozyBedroom', 'deepNight'];
const SHAPES: { value: ParticleShape; glyph: string }[] = [
  { value: 'star', glyph: '★' },
  { value: 'heart', glyph: '♥' },
  { value: 'cloud', glyph: '☁' },
  { value: 'moon', glyph: '◑' },
];

export default function SettingsScreen() {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const activeThemeId = useThemeStore((s) => s.activeThemeId);
  const setTheme = useThemeStore((s) => s.setTheme);
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>your cozy corner</Text>
          <Text style={styles.subtitle}>settings</Text>
        </View>

        {/* Mood / Theme */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>mood</Text>
          <View style={styles.themeGrid}>
            {THEME_ORDER.map((id) => {
              const t = THEMES[id];
              const isActive = id === activeThemeId;
              return (
                <Pressable
                  key={id}
                  style={[
                    styles.themeCard,
                    { backgroundColor: t.colors.surface },
                    { borderColor: isActive ? t.colors.primary : t.colors.taskCardBorder },
                    isActive && { borderWidth: 2 },
                  ]}
                  onPress={() => setTheme(id)}
                >
                  <View style={styles.swatchRow}>
                    <View style={[styles.swatch, { backgroundColor: t.colors.backgroundGradientStart }]} />
                    <View style={[styles.swatch, { backgroundColor: t.colors.primary }]} />
                    <View style={[styles.swatch, { backgroundColor: t.colors.accent }]} />
                  </View>
                  <Text style={[styles.themeName, { color: t.colors.text }]}>{t.name}</Text>
                  {isActive && (
                    <Text style={[styles.themeCheck, { color: t.colors.primary }]}>✦</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* What you collect */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>what you collect</Text>
          <View style={styles.shapeRow}>
            {SHAPES.map((s) => {
              const isActive = settings.collectibleShape === s.value;
              return (
                <Pressable
                  key={s.value}
                  style={[
                    styles.shapeChip,
                    isActive && { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary },
                  ]}
                  onPress={() => updateSettings({ collectibleShape: s.value })}
                >
                  <Text style={[styles.shapeGlyph, { color: isActive ? theme.colors.primary : theme.colors.textMuted }]}>
                    {s.glyph}
                  </Text>
                  <Text style={[styles.shapeLabel, { color: isActive ? theme.colors.primary : theme.colors.textMuted }]}>
                    {s.value}s
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Gentle preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>gentle preferences</Text>
          <View style={styles.card}>
            <ToggleRow
              label="dark mode"
              description="easier on sleepy eyes"
              value={settings.darkMode}
              onToggle={(v) => updateSettings({ darkMode: v })}
            />
            <Divider />
            <ToggleRow
              label="bedtime reminder"
              description={`a whisper at ${settings.reminderTime}`}
              value={settings.notificationsEnabled}
              onToggle={(v) => updateSettings({ notificationsEnabled: v })}
            />
            <Divider />
            <ToggleRow
              label="haptic feedback"
              description="a soft tap when you finish"
              value={settings.hapticFeedback}
              onToggle={(v) => updateSettings({ hapticFeedback: v })}
            />
            <Divider />
            <ToggleRow
              label="show streaks"
              description="kept quiet for now"
              value={settings.showStreaks}
              onToggle={(v) => updateSettings({ showStreaks: v })}
            />
            <Divider />
            <ToggleRow
              label="daily encouragement"
              description="gentle messages in your jar"
              value={settings.dailyEncouragementEnabled}
              onToggle={(v) => updateSettings({ dailyEncouragementEnabled: v })}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Divider() {
  const { theme } = useTheme();
  return (
    <View style={{
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.taskCardBorder,
      marginHorizontal: spacing.lg,
    }} />
  );
}

function ToggleRow({ label, description, value, onToggle }: {
  label: string; description: string;
  value: boolean; onToggle: (v: boolean) => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
      gap: spacing.md,
    }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: typography.size.md, color: theme.colors.text, fontFamily: fonts.regular }}>
          {label}
        </Text>
        <Text style={{ fontSize: typography.size.xs, color: theme.colors.textMuted, fontFamily: fonts.regular }}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.primary + '80' }}
        thumbColor={value ? theme.colors.primary : theme.colors.textSubtle}
      />
    </View>
  );
}

function makeStyles(theme: import('../../src/types').Theme) {
  return StyleSheet.create({
    root: { flex: 1 },
    scroll: { paddingBottom: spacing.xxxl, gap: spacing.xl },
    header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: 2 },
    title: {
      fontSize: typography.size.xxl, color: theme.colors.text,
      fontFamily: fonts.display, letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: typography.size.sm, color: theme.colors.textMuted,
      fontFamily: fonts.regular,
    },
    section: { gap: spacing.sm, paddingHorizontal: spacing.xl },
    sectionLabel: {
      fontSize: typography.size.xs, color: theme.colors.textSubtle,
      fontFamily: fonts.medium, letterSpacing: 0.5,
    },
    themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    themeCard: {
      width: '47%' as any, borderRadius: radius.lg,
      borderWidth: 1, padding: spacing.md, gap: spacing.xs,
    },
    swatchRow: { flexDirection: 'row', gap: spacing.xs },
    swatch: { width: 10, height: 10, borderRadius: radius.full },
    themeName: { fontSize: typography.size.sm, fontFamily: fonts.medium },
    themeCheck: { position: 'absolute', top: spacing.sm, right: spacing.sm, fontSize: 11 },
    shapeRow: { flexDirection: 'row', gap: spacing.sm },
    shapeChip: {
      flex: 1, alignItems: 'center', paddingVertical: spacing.md,
      borderRadius: radius.lg, borderWidth: 1,
      borderColor: theme.colors.taskCardBorder, gap: spacing.xs,
    },
    shapeGlyph: { fontSize: 22 },
    shapeLabel: { fontSize: typography.size.xs, fontFamily: fonts.regular },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: radius.lg, borderWidth: 1,
      borderColor: theme.colors.taskCardBorder, overflow: 'hidden',
    },
  });
}