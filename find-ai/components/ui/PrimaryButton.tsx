import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useHaptics } from '@/hooks/useHaptics';
import { AppText } from './AppText';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export function PrimaryButton({ title, onPress, disabled = false, style }: PrimaryButtonProps) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      style={[styles.button, disabled && styles.disabled, animatedStyle, StyleSheet.flatten(style)]}
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
      <AppText size="base" weight="bold" color={Colors.inkOnAccent}>
        {title}
      </AppText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: Spacing.radius.button,
    backgroundColor: Colors.accent,
    borderBottomWidth: 4,
    borderBottomColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.padding.card,
    paddingTop: 2,
  },
  disabled: {
    opacity: 0.4,
  },
});
