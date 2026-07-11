import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Spacing } from '@/constants/spacing';
import { useColors } from '@/theme';

interface HeartDisplayProps {
  /** Hearts remaining */
  hearts: number;
  total?: number;
  size?: number;
  style?: ViewStyle;
}

function AnimatedHeart({
  full,
  size,
  faintColor,
  dangerColor,
}: {
  full: boolean;
  size: number;
  faintColor: string;
  dangerColor: string;
}) {
  const scale = useSharedValue(1);
  const wasFull = useRef(full);

  useEffect(() => {
    if (wasFull.current && !full) {
      scale.value = withSequence(withTiming(1.3, { duration: 200 }), withTiming(0, { duration: 300 }));
    } else if (full) {
      scale.value = withTiming(1, { duration: 150 });
    }
    wasFull.current = full;
  }, [full, scale]);

  const filledStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value > 0 ? 1 : 0,
  }));

  return (
    <View style={{ width: size, height: size }}>
      <View style={StyleSheet.absoluteFill}>
        <MaterialCommunityIcons name="heart-outline" size={size} color={faintColor} />
      </View>
      <Animated.View style={[StyleSheet.absoluteFill, filledStyle]}>
        <MaterialCommunityIcons name="heart" size={size} color={dangerColor} />
      </Animated.View>
    </View>
  );
}

export function HeartDisplay({ hearts, total = 3, size = 20, style }: HeartDisplayProps) {
  const colors = useColors();

  return (
    <View style={[styles.row, style]}>
      {Array.from({ length: total }).map((_, i) => (
        <AnimatedHeart
          key={i}
          full={i < hearts}
          size={size}
          faintColor={colors.textFaint}
          dangerColor={colors.danger}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.gap.sm,
    alignItems: 'center',
  },
});
