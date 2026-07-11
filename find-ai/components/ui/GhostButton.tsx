import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useHaptics } from '@/hooks/useHaptics';
import { AppText } from './AppText';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GhostButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  /** Optional Feather icon rendered left of the label. */
  icon?: keyof typeof Feather.glyphMap;
  style?: ViewStyle | ViewStyle[];
}

export function GhostButton({ title, onPress, disabled = false, icon, style }: GhostButtonProps) {
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
      {icon ? <Feather name={icon} size={18} color={Colors.textPrimary} /> : null}
      <AppText size="base" weight="medium" color={Colors.textPrimary}>
        {title}
      </AppText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: Spacing.radius.button,
    backgroundColor: Colors.surface1,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.gap.xs,
    paddingHorizontal: Spacing.padding.card,
  },
  disabled: {
    opacity: 0.3,
  },
});
