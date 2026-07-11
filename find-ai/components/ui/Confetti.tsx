import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

const PARTICLE_COUNT = 36;
const DURATION = 1600;
const STAGGER = 40;

interface ParticleProps {
  index: number;
  startX: number;
  screenHeight: number;
}

function Particle({ index, startX, screenHeight }: ParticleProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * STAGGER,
      withTiming(1, { duration: DURATION, easing: Easing.in(Easing.quad) }),
    );
  }, [index, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -100 + progress.value * (screenHeight + 200) },
      { rotate: `${progress.value * 720}deg` },
    ],
    opacity: progress.value < 0.9 ? 1 : (1 - progress.value) * 10,
  }));

  const colors = [Colors.accent, Colors.warm, Colors.accentBlue, Colors.danger];
  return (
    <Animated.View
      style={[styles.particle, { left: startX, backgroundColor: colors[index % colors.length] }, animatedStyle]}
    />
  );
}

export function Confetti() {
  const { width, height } = Dimensions.get('window');

  const positions = useMemo(
    () => Array.from({ length: PARTICLE_COUNT }, () => Math.random() * width),
    [width],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {positions.map((x, i) => (
        <Particle key={i} index={i} startX={x} screenHeight={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: 12,
    borderRadius: 1,
  },
});
