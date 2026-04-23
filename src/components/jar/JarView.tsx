import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import type { JarEntry, JarDesign } from '../../types';
import { useTheme } from '../../theme';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { radius, spacing, typography } from '../../theme/tokens';
import { StarParticle } from './StarParticle';

// ─── Jar design labels ────────────────────────────────────────────────────────

const JAR_LABEL: Record<JarDesign, string> = {
  'star-jar':      '⬡',
  'moon-basket':   '◑',
  'dream-bottle':  '◈',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface JarViewProps {
  entries: JarEntry[];
  jarDesign: JarDesign;
  label?: string;       // e.g. "Today" or "Mon, Apr 7"
}

// ─── Component ────────────────────────────────────────────────────────────────

export function JarView({ entries, jarDesign, label }: JarViewProps) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const isEmpty = entries.length === 0;

  return (
    <View style={styles.wrapper}>
      {/* Jar label / date */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Jar container */}
      <View style={styles.jar}>
        {/* Jar lid */}
        <View style={styles.lid}>
          <Text style={[styles.lidIcon, { color: theme.colors.primary }]}>
            {JAR_LABEL[jarDesign]}
          </Text>
        </View>

        {/* Jar body */}
        <View style={styles.body}>
          {isEmpty ? (
            <View style={styles.emptyInner}>
              <Text style={styles.emptyDots}>· · ·</Text>
            </View>
          ) : (
            <View style={styles.particleGrid}>
              {entries.map((entry, i) => (
                <StarParticle
                  key={entry.taskId}
                  shape={entry.shape}
                  index={i}
                  size={i < 6 ? 24 : 18}
                />
              ))}
            </View>
          )}
        </View>

        {/* Fill level bar at the bottom */}
        {!isEmpty && (
          <View style={styles.fillBar}>
            <View style={[
              styles.fillBarInner,
              {
                width: `${Math.min((entries.length / 10) * 100, 100)}%` as any,
                backgroundColor: theme.colors.primary + '60',
              },
            ]} />
          </View>
        )}
      </View>

      {/* Count badge */}
      <View style={styles.countBadge}>
        <Text style={styles.countText}>
          {entries.length} {entries.length === 1 ? 'star' : 'stars'}
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(theme: import('../../types').Theme) {
  return StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    label: {
      fontSize: typography.size.sm,
      color: theme.colors.textMuted,
      fontWeight: typography.weight.medium,
      textTransform: 'lowercase',
    },
    jar: {
      width: 200,
      borderRadius: radius.xl,
      borderWidth: 1.5,
      borderColor: theme.colors.primary + '50',
      backgroundColor: theme.colors.jarBackground,
      overflow: 'hidden',
    },
    lid: {
      height: 36,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primary + '30',
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lidIcon: {
      fontSize: 18,
    },
    body: {
      minHeight: 180,
      padding: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyInner: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    emptyDots: {
      fontSize: typography.size.xl,
      color: theme.colors.textSubtle,
      letterSpacing: 4,
    },
    particleGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    fillBar: {
      height: 4,
      backgroundColor: theme.colors.surfaceAlt,
    },
    fillBarInner: {
      height: 4,
      borderRadius: radius.full,
    },
    countBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.full,
      backgroundColor: theme.colors.surfaceAlt,
    },
    countText: {
      fontSize: typography.size.xs,
      color: theme.colors.textMuted,
      fontWeight: typography.weight.medium,
    },
  });
}
