import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import type { EncouragementContext } from '../../lib/encouragement';
import { getEncouragement } from '../../lib/encouragement';
import { useTheme } from '../../theme';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { spacing, radius, typography } from '../../theme/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DailyEncouragementProps {
  context: EncouragementContext;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DailyEncouragement({ context }: DailyEncouragementProps) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const [message, setMessage] = useState(() => getEncouragement(context));
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleRefresh = useCallback(() => {
    scale.value = withSpring(0.94, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 15 });
    });
    setMessage(getEncouragement(context));
  }, [context]);

  return (
    <Animated.View style={animStyle}>
      <Pressable style={styles.card} onPress={handleRefresh}>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.hint}>tap for another</Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(theme: import('../../types').Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.taskCardBorder,
      padding: spacing.lg,
      alignItems: 'center',
      gap: spacing.xs,
    },
    message: {
      fontSize: typography.size.md,
      color: theme.colors.text,
      textAlign: 'center',
      fontWeight: typography.weight.regular,
      lineHeight: typography.size.md * 1.6,
    },
    hint: {
      fontSize: typography.size.xs,
      color: theme.colors.textSubtle,
    },
  });
}
