import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Spacing } from '@/constants/spacing';
import { useHaptics } from '@/hooks/useHaptics';
import { useColors } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  variant?: 'default' | 'strong' | 'highlighted';
  padding?: 'normal' | 'large' | 'none';
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
}

export function Card({ variant = 'default', padding = 'normal', onPress, style, children }: CardProps) {
  const colors = useColors();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderColors = {
    default: colors.borderDefault,
    strong: colors.borderStrong,
    highlighted: colors.accent,
  } as const;

  const base: ViewStyle = {
    backgroundColor: colors.surface1,
    borderWidth: 2,
    borderColor: borderColors[variant],
    borderBottomWidth: 4,
    borderBottomColor:
      variant === 'highlighted' ? colors.accentMuted : colors.borderDefault,
    borderRadius: Spacing.radius.card,
    padding: padding === 'none' ? 0 : padding === 'large' ? Spacing.padding.cardLg : Spacing.padding.card,
  };

  if (!onPress) {
    return <View style={StyleSheet.flatten([base, style])}>{children}</View>;
  }

  return (
    <AnimatedPressable
      style={[StyleSheet.flatten([base, style]), animatedStyle]}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      }}
      onPress={() => {
        haptics.light();
        onPress();
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
