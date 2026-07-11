import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Spacing } from '@/constants/spacing';
import { AppText } from '@/components/ui/AppText';
import { type ColorPalette, useColors } from '@/theme';

export type OptionState =
  | 'default'
  | 'selected-correct'
  | 'selected-wrong'
  | 'revealed-correct'
  | 'disabled';

interface OptionButtonProps {
  text: string;
  state: OptionState;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.gap.sm,
      backgroundColor: colors.surface2,
      borderRadius: Spacing.radius.card,
      borderBottomWidth: 4,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    text: {
      flex: 1,
    },
    dimmed: {
      opacity: 0.7,
    },
    correct: {
      backgroundColor: colors.accentMuted + '55',
    },
    wrong: {
      backgroundColor: colors.dangerMuted + '44',
    },
  });
}

export function OptionButton({ text, state, onPress }: OptionButtonProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const interactive = state === 'default';
  const shake = useSharedValue(0);

  useEffect(() => {
    if (state === 'selected-wrong') {
      shake.value = withSequence(
        withTiming(-6, { duration: 80 }),
        withTiming(6, { duration: 80 }),
        withTiming(-4, { duration: 80 }),
        withTiming(4, { duration: 80 }),
        withTiming(0, { duration: 80 }),
      );
    }
  }, [shake, state]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const borderColor =
    state === 'selected-correct' || state === 'revealed-correct'
      ? colors.accent
      : state === 'selected-wrong'
        ? colors.danger
        : colors.borderDefault;

  const borderWidth = 2;

  return (
    <AnimatedPressable
      disabled={!interactive}
      onPress={onPress}
      style={[
        styles.option,
        { borderColor, borderWidth, borderBottomColor: borderColor },
        state === 'selected-correct' && styles.correct,
        state === 'selected-wrong' && styles.wrong,
        state === 'disabled' && styles.dimmed,
        shakeStyle,
      ]}
    >
      <AppText size="question" style={styles.text}>
        {text}
      </AppText>
      {state === 'selected-correct' || state === 'revealed-correct' ? (
        <Feather name="check" size={20} color={colors.accent} />
      ) : state === 'selected-wrong' ? (
        <Feather name="x" size={20} color={colors.danger} />
      ) : null}
    </AnimatedPressable>
  );
}
