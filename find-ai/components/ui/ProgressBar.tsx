import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';

interface ProgressBarProps {
  /** 0 to 1 */
  progress: number;
  height?: number;
  color?: string;
  trackColor?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  height = 12,
  color = Colors.accent,
  trackColor = Colors.borderDefault,
  style,
}: ProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.min(Math.max(progress, 0), 1), {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View
      style={[styles.track, { height, backgroundColor: trackColor, borderWidth: height >= 8 ? 1 : 0 }, style]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: Spacing.radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  fill: {
    height: '100%',
    borderRadius: Spacing.radius.full,
  },
});
