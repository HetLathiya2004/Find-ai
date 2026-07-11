import React, { useMemo } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Spacing } from '@/constants/spacing';
import { useHaptics } from '@/hooks/useHaptics';
import { AppText } from './AppText';
import { type ColorPalette, useColors } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    button: {
      minHeight: 50,
      borderRadius: Spacing.radius.button,
      backgroundColor: colors.accent,
      borderBottomWidth: 4,
      borderBottomColor: colors.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.padding.card,
      paddingTop: 1,
    },
    disabled: {
      opacity: 0.4,
    },
  });
}

export function PrimaryButton({ title, onPress, disabled = false, style }: PrimaryButtonProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
      <AppText size="base" weight="bold" color={colors.inkOnAccent}>
        {title.toUpperCase()}
      </AppText>
    </AnimatedPressable>
  );
}
