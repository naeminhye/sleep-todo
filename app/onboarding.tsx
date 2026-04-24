import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  StyleSheet, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming,
} from 'react-native-reanimated';

import { useThemeStore, THEMES } from '../src/stores/themeStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useTheme } from '../src/theme';
import { spacing, typography, radius, fonts } from '../src/theme/tokens';

const THEME_ORDER = ['dreamyDusk','strawberryDream','cloudyMeadow','cozyBedroom','deepNight'];

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const setTheme       = useThemeStore((s) => s.setTheme);
  const activeThemeId  = useThemeStore((s) => s.activeThemeId);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [name, setName] = useState('');
  const [step, setStep] = useState<'theme' | 'name'>('theme');

  const buttonScale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleNext = () => {
    if (step === 'theme') { setStep('name'); return; }
    updateSettings({
      userName: name.trim() || 'friend',
      onboardingComplete: true,
    });
    router.replace('/(tabs)');
  };

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95, { damping: 15 });
  };
  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15 });
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Moon mascot */}
        <View style={s.mascotWrap}>
          <View style={[s.mascot, { backgroundColor: theme.colors.accent }]}>
            <Text style={s.mascotFace}>· ·</Text>
          </View>
          <Text style={s.zzz}>zz{'\n'}z</Text>
        </View>

        {/* Title */}
        <View style={s.titleWrap}>
          <Text style={[s.appName, { color: theme.colors.primary, fontFamily: fonts.display }]}>
            sleepy{'\n'}to-do
          </Text>
          <Text style={[s.tagline, { color: theme.colors.textMuted, fontFamily: fonts.regular }]}>
            a gentle little home for your{'\n'}tiny everyday wins
          </Text>
        </View>

        {step === 'theme' ? (
          <>
            <Text style={[s.sectionLabel, { color: theme.colors.textMuted, fontFamily: fonts.medium }]}>
              pick a mood
            </Text>
            <View style={s.themeGrid}>
              {THEME_ORDER.map((id) => {
                const t = THEMES[id];
                const isActive = id === activeThemeId;
                return (
                  <Pressable
                    key={id}
                    style={[
                      s.themeChip,
                      {
                        backgroundColor: t.colors.surface,
                        borderColor: isActive ? t.colors.primary : t.colors.taskCardBorder,
                        borderWidth: isActive ? 2 : 1,
                      },
                    ]}
                    onPress={() => setTheme(id)}
                  >
                    <View style={s.themeChipSwatches}>
                      <View style={[s.swatch, { backgroundColor: t.colors.backgroundGradientStart }]} />
                      <View style={[s.swatch, { backgroundColor: t.colors.primary }]} />
                      <View style={[s.swatch, { backgroundColor: t.colors.accent }]} />
                    </View>
                    <Text style={[s.themeName, { color: t.colors.text, fontFamily: fonts.medium }]}>
                      {t.name}
                    </Text>
                    {isActive && (
                      <Text style={[s.themeCheck, { color: t.colors.primary }]}>✦</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : (
          <View style={s.nameWrap}>
            <Text style={[s.sectionLabel, { color: theme.colors.textMuted, fontFamily: fonts.medium }]}>
              what should i call you?
            </Text>
            <TextInput
              style={[s.nameInput, {
                color: theme.colors.text,
                borderBottomColor: theme.colors.primary,
                fontFamily: fonts.regular,
              }]}
              value={name}
              onChangeText={setName}
              placeholder="your name..."
              placeholderTextColor={theme.colors.textSubtle}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />
          </View>
        )}
      </ScrollView>

      {/* CTA button */}
      <View style={[s.footer, { backgroundColor: theme.colors.background }]}>
        <Animated.View style={buttonStyle}>
          <Pressable
            style={[s.cta, { backgroundColor: theme.colors.primary }]}
            onPress={handleNext}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Text style={[s.ctaLabel, { fontFamily: fonts.medium }]}>
              {step === 'theme' ? 'tuck me in →' : 'let\'s go ✦'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.xl, paddingBottom: 120 },
  mascotWrap: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.xs },
  mascot: {
    width: 56, height: 56, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  mascotFace: { fontSize: 14, color: '#ffffff', letterSpacing: 2 },
  zzz: { fontSize: 13, color: '#b3a6c9', lineHeight: 16, marginTop: 4 },
  titleWrap: { gap: spacing.sm },
  appName: { fontSize: 42, lineHeight: 46 },
  tagline: { fontSize: typography.size.md, lineHeight: 24 },
  sectionLabel: { fontSize: typography.size.sm },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  themeChip: {
    width: '47%' as any,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  themeChipSwatches: { flexDirection: 'row', gap: spacing.xs },
  swatch: { width: 10, height: 10, borderRadius: radius.full },
  themeName: { fontSize: typography.size.sm },
  themeCheck: { position: 'absolute', top: spacing.sm, right: spacing.sm, fontSize: 12 },
  nameWrap: { gap: spacing.lg, paddingTop: spacing.lg },
  nameInput: {
    fontSize: typography.size.xl,
    borderBottomWidth: 1.5,
    paddingVertical: spacing.sm,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxxl : spacing.xl,
  },
  cta: {
    borderRadius: radius.full,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  ctaLabel: { fontSize: typography.size.md, color: '#ffffff' },
});
