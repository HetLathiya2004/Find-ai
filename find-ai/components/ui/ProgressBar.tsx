import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Spacing } from '@/constants/spacing';
import { type ColorPalette, useColors } from '@/theme';

interface ProgressBarProps {
  /** 0 to 1 */
  progress: number;
  height?: number;
  color?: string;
  trackColor?: string;
  style?: ViewStyle;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    track: {
      width: '100%',
      borderRadius: Spacing.radius.full,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderDefault,
    },
    fill: {
      height: '100%',
      borderRadius: Spacing.radius.full,
    },
  });
}

export function ProgressBar({
  progress,
  height = 12,
  color,
  trackColor,
  style,
}: ProgressBarProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const fillColor = color ?? colors.accent;
  const resolvedTrackColor = trackColor ?? colors.borderDefault;
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
      style={[styles.track, { height, backgroundColor: resolvedTrackColor, borderWidth: height >= 8 ? 1 : 0 }, style]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: fillColor }, fillStyle]} />
    </View>
  );
}
