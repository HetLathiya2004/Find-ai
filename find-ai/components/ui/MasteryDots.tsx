import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Spacing } from '@/constants/spacing';
import { useColors } from '@/theme';

interface MasteryDotsProps {
  /** 0-5 filled dots */
  level: number;
  total?: number;
  size?: number;
  style?: ViewStyle;
}

function Dot({
  filled,
  index,
  size,
  filledColor,
  emptyColor,
}: {
  filled: boolean;
  index: number;
  size: number;
  filledColor: string;
  emptyColor: string;
}) {
  const opacity = useSharedValue(filled ? 0 : 1);

  useEffect(() => {
    if (filled) {
      opacity.value = withDelay(index * 100, withTiming(1, { duration: 300 }));
    }
  }, [filled, index, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: filled ? filledColor : emptyColor,
        },
        animatedStyle,
      ]}
    />
  );
}

export function MasteryDots({ level, total = 5, size = 8, style }: MasteryDotsProps) {
  const colors = useColors();

  return (
    <View style={[styles.row, style]}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot
          key={i}
          filled={i < level}
          index={i}
          size={size}
          filledColor={colors.textPrimary}
          emptyColor={colors.borderDefault}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.gap.xs,
    alignItems: 'center',
  },
});
