import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import type { MockQuizQuestion } from '@/constants/mock-data';
import { AppText } from '@/components/ui/AppText';
import { OptionButton, OptionState } from './OptionButton';

interface QuestionCardProps {
  question: MockQuizQuestion;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

function stateFor(question: MockQuizQuestion, selectedIndex: number | null, index: number): OptionState {
  if (selectedIndex === null) return 'default';
  const isCorrect = index === question.correct_index;
  if (index === selectedIndex) return isCorrect ? 'selected-correct' : 'selected-wrong';
  if (isCorrect) return 'revealed-correct';
  return 'disabled';
}

export function QuestionCard({ question, selectedIndex, onSelect }: QuestionCardProps) {
  const answered = selectedIndex !== null;
  const wasCorrect = answered && selectedIndex === question.correct_index;

  return (
    <View>
      <AppText size="xl" weight="medium" leading="normal" style={styles.question}>
        {question.question}
      </AppText>
      <View style={styles.options}>
        {question.options.map((option, i) => (
          <OptionButton
            key={i}
            text={option}
            state={stateFor(question, selectedIndex, i)}
            onPress={() => onSelect(i)}
          />
        ))}
      </View>
      {answered ? (
        <Animated.View entering={FadeIn.duration(200)} style={styles.explanation}>
          <AppText size="caption" label color={wasCorrect ? Colors.accent : Colors.danger}>
            {wasCorrect ? 'Correct' : 'Not quite'}
          </AppText>
          <AppText size="sm" color={Colors.textSecondary} leading="normal" style={styles.explanationText}>
            {question.explanation}
          </AppText>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    marginBottom: Spacing.gap['2xl'],
  },
  options: {
    gap: Spacing.gap.md,
  },
  explanation: {
    marginTop: Spacing.gap.xl,
    backgroundColor: Colors.surface1,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderRadius: Spacing.radius.card,
    padding: 16,
  },
  explanationText: {
    marginTop: 6,
  },
});
