import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Spacing } from '@/constants/spacing';
import { type ColorPalette, useColors } from '@/theme';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'circle';
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    base: {
      backgroundColor: colors.surface2,
    },
    screen: {
      flex: 1,
      padding: Spacing.padding.screen,
    },
  });
}

/** Pulsing placeholder block matching the layout it replaces. */
export function Skeleton({ variant = 'text', width = '100%', height, style }: SkeletonProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const resolvedHeight = height ?? (variant === 'text' ? 14 : variant === 'circle' ? 48 : 120);
  const resolvedWidth = variant === 'circle' ? resolvedHeight : width;

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width: resolvedWidth,
          height: resolvedHeight,
          borderRadius:
            variant === 'circle' ? resolvedHeight / 2 : variant === 'card' ? Spacing.radius.card : 4,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** Generic full-screen list skeleton used while a screen's mock data "loads". */
export function ScreenSkeleton({ rows = 4 }: { rows?: number }) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.screen}>
      <Skeleton variant="text" width={120} height={24} />
      <View style={{ height: Spacing.gap.xl }} />
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={{ marginBottom: Spacing.gap.md }}>
          <Skeleton variant="card" height={104} />
        </View>
      ))}
    </View>
  );
}
