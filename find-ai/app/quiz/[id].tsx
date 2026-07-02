import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExitModal } from '@/components/lesson/ExitModal';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { AppText } from '@/components/ui/AppText';
import { GhostButton } from '@/components/ui/GhostButton';
import { HeartDisplay } from '@/components/ui/HeartDisplay';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SegmentBar } from '@/components/ui/SegmentBar';
import { XPReward } from '@/components/ui/XPReward';
import { Colors } from '@/constants/colors';
import { getConceptById, getQuizById } from '@/constants/mock-data';
import { Spacing } from '@/constants/spacing';
import { useHaptics } from '@/hooks/useHaptics';
import { useMockProgress } from '@/hooks/useMockProgress';

const TOTAL_HEARTS = 3;

type Phase = 'question' | 'out-of-hearts' | 'score' | 'reward';

export default function QuizPlayerScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const { id } = useLocalSearchParams<{ id: string }>();
  const quiz = getQuizById(id ?? '');
  const concept = quiz ? getConceptById(quiz.concept_id) : undefined;
  const progress = useMockProgress();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hearts, setHearts] = useState(TOTAL_HEARTS);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<Phase>('question');
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    if (quiz) progress.startQuiz(quiz.concept_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.id]);

  if (!quiz) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <AppText size="base" color={Colors.textSecondary}>
            Quiz not found.
          </AppText>
          <PrimaryButton title="Go back" onPress={() => router.back()} style={{ marginTop: 20 }} />
        </View>
      </SafeAreaView>
    );
  }

  const question = quiz.questions[questionIndex];
  const isLastQuestion = questionIndex === quiz.questions.length - 1;
  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = score >= quiz.pass_threshold;

  const selectOption = (index: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);
    const correct = index === question.correct_index;
    if (correct) {
      haptics.medium();
      setCorrectCount((c) => c + 1);
    } else {
      haptics.warning();
      const remaining = hearts - 1;
      setHearts(remaining);
      if (remaining === 0) {
        // Let the heart-loss animation play before switching screens.
        setTimeout(() => setPhase('out-of-hearts'), 700);
      }
    }
  };

  const continueToNext = () => {
    haptics.light();
    if (isLastQuestion) {
      progress.completeQuiz(quiz.concept_id, score, passed, quiz.xp_reward);
      if (passed) haptics.success();
      setPhase('score');
    } else {
      setQuestionIndex((i) => i + 1);
      setSelectedIndex(null);
    }
  };

  if (phase === 'out-of-hearts') {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <AppText size="6xl" center>
            💔
          </AppText>
          <AppText size="2xl" weight="medium" center style={styles.outTitle}>
            Out of hearts
          </AppText>
          <AppText size="sm" color={Colors.textSecondary} center style={styles.outSubtitle}>
            Review the lesson and try again — the concepts will stick.
          </AppText>
        </View>
        <View style={styles.bottom}>
          <PrimaryButton title="Back to concept" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'reward') {
    return (
      <XPReward xp={quiz.xp_reward} subtitle="Quiz passed" onContinue={() => router.back()} />
    );
  }

  if (phase === 'score') {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <AppText
            weight="medium"
            color={passed ? Colors.accent : Colors.danger}
            center
            style={styles.scoreText}
          >
            {score}%
          </AppText>
          <AppText size="xl" weight="medium" center style={styles.outTitle}>
            {passed ? 'Quiz passed!' : 'Not quite there'}
          </AppText>
          <AppText size="sm" color={Colors.textSecondary} center style={styles.outSubtitle}>
            {correctCount} of {quiz.questions.length} correct
            {concept ? ` — ${concept.title}` : ''}
          </AppText>
        </View>
        <View style={styles.bottom}>
          {passed ? (
            <PrimaryButton title="Claim XP" onPress={() => setPhase('reward')} />
          ) : (
            <>
              <PrimaryButton
                title="Try again"
                onPress={() => {
                  setQuestionIndex(0);
                  setSelectedIndex(null);
                  setHearts(TOTAL_HEARTS);
                  setCorrectCount(0);
                  setPhase('question');
                }}
                style={styles.retryButton}
              />
              <GhostButton title="Back to concept" onPress={() => router.back()} />
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Top bar: [X] [SegmentBar] [hearts] */}
      <View style={styles.topBar}>
        <Pressable
          hitSlop={12}
          onPress={() => {
            haptics.light();
            setShowExitModal(true);
          }}
        >
          <X size={24} color={Colors.textSecondary} />
        </Pressable>
        <SegmentBar total={quiz.questions.length} completed={questionIndex + 1} style={styles.segments} />
        <HeartDisplay hearts={hearts} size={18} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <QuestionCard question={question} selectedIndex={selectedIndex} onSelect={selectOption} />
      </ScrollView>

      {selectedIndex !== null && hearts > 0 ? (
        <View style={styles.bottom}>
          <PrimaryButton title={isLastQuestion ? 'See results' : 'Continue'} onPress={continueToNext} />
        </View>
      ) : null}

      <ExitModal
        visible={showExitModal}
        onExit={() => {
          setShowExitModal(false);
          router.back();
        }}
        onKeepLearning={() => setShowExitModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.padding.cardLg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap.lg,
    paddingHorizontal: Spacing.padding.screen,
    paddingVertical: Spacing.gap.md,
  },
  segments: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: Spacing.padding.screen,
    paddingTop: Spacing.gap.xl,
  },
  bottom: {
    padding: Spacing.padding.screen,
    paddingBottom: 24,
  },
  outTitle: {
    marginTop: Spacing.gap.lg,
  },
  outSubtitle: {
    marginTop: Spacing.gap.sm,
  },
  scoreText: {
    fontSize: 60,
    lineHeight: 66,
  },
  retryButton: {
    marginBottom: Spacing.gap.md,
  },
});
