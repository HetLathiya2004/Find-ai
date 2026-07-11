import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '@/theme';

const PARTICLE_COUNT = 36;
const DURATION = 1600;
const STAGGER = 40;

interface ParticleProps {
  index: number;
  startX: number;
  screenHeight: number;
}

function Particle({ index, startX, screenHeight }: ParticleProps) {
  const colors = useColors();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * STAGGER,
      withTiming(1, { duration: DURATION, easing: Easing.in(Easing.quad) }),
    );
  }, [index, progress]);

  const style = useAnimatedStyle(() => {
    const t = progress.value;
    const drift = ((index % 5) - 2) * 28;
    return {
      opacity: t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85,
      transform: [
        { translateX: startX + drift * t },
        { translateY: -20 + screenHeight * 0.7 * t },
        { rotate: `${index * 40 + t * 180}deg` },
        { scale: 1 - t * 0.4 },
      ],
    };
  });

  const particleColors = [colors.accent, colors.warm, colors.accentBlue, colors.danger];
  const color = particleColors[index % particleColors.length];
  const size = 6 + (index % 4) * 2;

  return (
    <Animated.View
      style={[
        styles.particle,
        { width: size, height: size, backgroundColor: color, borderRadius: size / 3 },
        style,
      ]}
    />
  );
}

export function Confetti() {
  const { width, height } = Dimensions.get('window');
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    index: i,
    startX: (width / PARTICLE_COUNT) * i + (i % 3) * 4,
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p) => (
        <Particle key={p.index} index={p.index} startX={p.startX} screenHeight={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
  },
});
