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
  const scale = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      style={[styles.button, disabled && styles.disabled, animatedStyle, StyleSheet.flatten(style)]}
      onPressIn={() => {
        scale.value = withSpring(2, { damping: 18, stiffness: 450 });
      }}
      onPressOut={() => {
        scale.value = withSpring(0, { damping: 18, stiffness: 450 });
      }}
      onPress={() => {
        haptics.light();
        onPress();
      }}
    >
      <AppText size="base" weight="bold" color={Colors.inkOnAccent}>
        {title.toUpperCase()}
      </AppText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: Spacing.radius.button,
    backgroundColor: Colors.accent,
    borderBottomWidth: 4,
    borderBottomColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.padding.card,
    paddingTop: 1,
  },
  disabled: {
    opacity: 0.4,
  },
});
