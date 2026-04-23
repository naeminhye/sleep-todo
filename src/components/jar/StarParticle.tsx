import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

import type { ParticleShape } from '../../types';
import { useTheme } from '../../theme';

// ─── Shape glyphs ─────────────────────────────────────────────────────────────

const SHAPE_GLYPH: Record<ParticleShape, string> = {
  star:    '✦',
  heart:   '♥',
  cloud:   '☁',
  sparkle: '✿',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface StarParticleProps {
  shape: ParticleShape;
  index: number;       // used to stagger entrance animation
  size?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StarParticle({ shape, index, size = 22 }: StarParticleProps) {
  const { theme } = useTheme();

  const scale   = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = (index % 12) * 40;
    scale.value   = withDelay(delay, withSpring(1, { damping: 14, stiffness: 180 }));
    opacity.value = withDelay(delay, withSpring(1, { damping: 20 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[
      styles.glyph,
      animStyle,
      { fontSize: size, color: theme.colors.primary },
    ]}>
      {SHAPE_GLYPH[shape]}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  glyph: {
    lineHeight: undefined,
  },
});
