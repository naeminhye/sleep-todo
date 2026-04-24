import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { JarEntry } from '../../types';
import { useTheme } from '../../theme';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { radius, spacing, typography, fonts } from '../../theme/tokens';

const SHAPE_GLYPH: Record<string, string> = {
  star: '★', heart: '♥', cloud: '☁', moon: '◑',
};

function getStarPositions(count: number) {
  const positions = [];
  const cols = 5;
  for (let i = 0; i < Math.min(count, 20); i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const jitterX = ((i * 37) % 12) - 6;
    const jitterY = ((i * 53) % 8) - 4;
    positions.push({
      x: 20 + col * 36 + jitterX,
      y: 10 + row * 32 + jitterY,
    });
  }
  return positions;
}

interface JarViewProps {
  entries: JarEntry[];
  totalStars: number;
  shape: string;
}

export function JarView({ entries, totalStars, shape }: JarViewProps) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const positions = getStarPositions(entries.length);
  const glyph = SHAPE_GLYPH[shape] ?? '★';
  const fillPercent = Math.min((entries.length / 20) * 100, 100);

  return (
    <View style={styles.wrapper}>
      <View style={styles.jarOuter}>
        {/* Lid */}
        <View style={styles.lid}>
          <View style={[styles.lidInner, { backgroundColor: theme.colors.primary + '30' }]} />
        </View>

        {/* Neck */}
        <View style={[styles.neck, { borderColor: theme.colors.primary + '40' }]} />

        {/* Body */}
        <View style={[styles.body, { borderColor: theme.colors.primary + '40' }]}>
          {/* Fill */}
          <View style={[
            styles.fill,
            {
              height: `${fillPercent}%` as any,
              backgroundColor: theme.colors.primary + '12',
            },
          ]} />

          {/* Stars */}
          {entries.length === 0 ? (
            <Text style={[styles.emptyHint, { color: theme.colors.textSubtle }]}>
              · · ·
            </Text>
          ) : (
            positions.map((pos, i) => (
              <Text
                key={entries[i]?.taskId ?? i}
                style={[
                  styles.starInJar,
                  {
                    color: theme.colors.accent,
                    position: 'absolute',
                    left: pos.x,
                    bottom: pos.y,
                    fontSize: i < 5 ? 20 : 14,
                  },
                ]}
              >
                {glyph}
              </Text>
            ))
          )}

          {/* Overflow */}
          {entries.length > 20 && (
            <Text style={[styles.overflow, { color: theme.colors.primary }]}>
              +{entries.length - 20}
            </Text>
          )}
        </View>
      </View>

      <Text style={[styles.count, { color: theme.colors.text }]}>
        {totalStars} stars
      </Text>
    </View>
  );
}

function makeStyles(theme: import('../../types').Theme) {
  return StyleSheet.create({
    wrapper: { alignItems: 'center', gap: spacing.sm },
    jarOuter: { alignItems: 'center', width: 180 },
    lid: {
      width: 100, height: 22,
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: theme.colors.primary + '60',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 2,
    },
    lidInner: { width: 70, height: 8, borderRadius: 4 },
    neck: {
      width: 80, height: 12,
      borderLeftWidth: 1.5, borderRightWidth: 1.5,
      borderColor: theme.colors.primary + '40',
      backgroundColor: theme.colors.surface,
    },
    body: {
      width: 160, height: 180,
      borderWidth: 1.5,
      borderTopWidth: 0,
      borderColor: theme.colors.primary + '40',
      borderBottomLeftRadius: radius.xl,
      borderBottomRightRadius: radius.xl,
      backgroundColor: theme.colors.jarBackground,
      overflow: 'hidden',
    },
    fill: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      borderBottomLeftRadius: radius.xl,
      borderBottomRightRadius: radius.xl,
    },
    emptyHint: {
      position: 'absolute', bottom: 24, alignSelf: 'center',
      fontSize: typography.size.xl, letterSpacing: 6,
    },
    starInJar: { lineHeight: 24 },
    overflow: {
      position: 'absolute', bottom: 8, right: 12,
      fontSize: typography.size.sm, fontFamily: fonts.medium,
    },
    count: {
      fontSize: typography.size.lg,
      fontFamily: fonts.display,
    },
  });
}