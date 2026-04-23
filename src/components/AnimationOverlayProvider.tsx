import React, { createContext, useContext, useRef, useCallback, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParticleAnimation {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  shape: string;
  color: string;
}

interface OverlayContextValue {
  fireParticle: (anim: Omit<ParticleAnimation, 'id'>) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function useAnimationOverlay() {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useAnimationOverlay must be inside AnimationOverlayProvider');
  return ctx;
}

// ─── Provider + overlay layer ─────────────────────────────────────────────────

export function AnimationOverlayProvider({ children }: { children: React.ReactNode }) {
  const [particles, setParticles] = useState<ParticleAnimation[]>([]);
  const counterRef = useRef(0);

  const fireParticle = useCallback((anim: Omit<ParticleAnimation, 'id'>) => {
    const id = `p-${counterRef.current++}`;
    setParticles((prev) => [...prev, { ...anim, id }]);
    // Remove after animation completes
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 900);
  }, []);

  return (
    <OverlayContext.Provider value={{ fireParticle }}>
      {children}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {particles.map((p) => (
          <FlyingParticle key={p.id} {...p} />
        ))}
      </View>
    </OverlayContext.Provider>
  );
}

// ─── FlyingParticle ───────────────────────────────────────────────────────────

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

function FlyingParticle({ fromX, fromY, toX, toY, shape, color }: ParticleAnimation) {
  const x       = useSharedValue(fromX);
  const y       = useSharedValue(fromY);
  const scale   = useSharedValue(0);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    // Pop in
    scale.value = withSpring(1.3, { damping: 10, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 12 });
    });
    // Fly to jar tab
    x.value = withTiming(toX, { duration: 650, easing: Easing.out(Easing.cubic) });
    y.value = withTiming(toY, { duration: 650, easing: Easing.in(Easing.cubic) });
    // Fade out near destination
    opacity.value = withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 250 })
    );
    // Scale down at end
    scale.value = withSequence(
      withTiming(1, { duration: 500 }),
      withTiming(0.4, { duration: 200 })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x.value - 14,
    top: y.value - 14,
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text style={[style, { fontSize: 28, color }]}>
      {shape}
    </Animated.Text>
  );
}
