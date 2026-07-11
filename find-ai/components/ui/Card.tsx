import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useHaptics } from '@/hooks/useHaptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  variant?: 'default' | 'strong' | 'highlighted';
  padding?: 'normal' | 'large' | 'none';
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
}

const BORDER_COLORS = {
  default: Colors.borderDefault,
  strong: Colors.borderStrong,
  highlighted: Colors.accent,
} as const;

export function Card({ variant = 'default', padding = 'normal', onPress, style, children }: CardProps) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const base: ViewStyle = {
    backgroundColor: Colors.surface1,
    borderWidth: 1,
    borderColor: BORDER_COLORS[variant],
    borderRadius: Spacing.radius.card,
    padding: padding === 'none' ? 0 : padding === 'large' ? Spacing.padding.cardLg : Spacing.padding.card,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 2,
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
