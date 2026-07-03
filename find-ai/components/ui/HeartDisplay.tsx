import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';

interface HeartDisplayProps {
  /** Hearts remaining */
  hearts: number;
  total?: number;
  size?: number;
  style?: ViewStyle;
}

function AnimatedHeart({ full, size }: { full: boolean; size: number }) {
  const scale = useSharedValue(1);
  const wasFull = useRef(full);

  useEffect(() => {
    if (wasFull.current && !full) {
      // Heart lost: scale up, then shrink away while the faint outline remains
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
      {/* Lost-heart outline underneath */}
      <View style={StyleSheet.absoluteFill}>
        <MaterialCommunityIcons name="heart-outline" size={size} color={Colors.textFaint} />
      </View>
      <Animated.View style={[StyleSheet.absoluteFill, filledStyle]}>
        <MaterialCommunityIcons name="heart" size={size} color={Colors.danger} />
      </Animated.View>
    </View>
  );
}

export function HeartDisplay({ hearts, total = 3, size = 20, style }: HeartDisplayProps) {
  return (
    <View style={[styles.row, style]}>
      {Array.from({ length: total }).map((_, i) => (
        <AnimatedHeart key={i} full={i < hearts} size={size} />
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
