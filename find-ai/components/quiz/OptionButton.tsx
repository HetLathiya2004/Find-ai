import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { AppText } from '@/components/ui/AppText';

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

export function OptionButton({ text, state, onPress }: OptionButtonProps) {
  const interactive = state === 'default';

  const borderColor =
    state === 'selected-correct' || state === 'revealed-correct'
      ? Colors.accent
      : state === 'selected-wrong'
        ? Colors.danger
        : Colors.borderDefault;

  const borderWidth = state === 'selected-correct' || state === 'revealed-correct' ? 2 : 1;

  return (
    <Pressable
      disabled={!interactive}
      onPress={onPress}
      style={[
        styles.option,
        { borderColor, borderWidth },
        state === 'selected-correct' && styles.correct,
        state === 'selected-wrong' && styles.wrong,
        state === 'disabled' && styles.dimmed,
      ]}
    >
      <AppText size="question" style={styles.text}>
        {text}
      </AppText>
      {state === 'selected-correct' || state === 'revealed-correct' ? (
        <Feather name="check" size={20} color={Colors.accent} />
      ) : state === 'selected-wrong' ? (
        <Feather name="x" size={20} color={Colors.danger} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.gap.sm,
    backgroundColor: Colors.surface2,
    borderRadius: Spacing.radius.card,
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
    backgroundColor: Colors.accentMuted + '55',
  },
  wrong: {
    backgroundColor: Colors.dangerMuted + '44',
  },
});
