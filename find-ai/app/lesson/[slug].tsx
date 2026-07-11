import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  useSharedValue,
  withTiming,
  type EntryAnimationsValues,
  type ExitAnimationsValues,
  type LayoutAnimation,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExitModal } from '@/components/lesson/ExitModal';
import { LessonCard } from '@/components/lesson/LessonCard';
import { AppText } from '@/components/ui/AppText';
import { LoadingScene } from '@/components/ui/LoadingScene';
import { ErrorState } from '@/components/ui/ErrorState';
import { GhostButton } from '@/components/ui/GhostButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SegmentBar } from '@/components/ui/SegmentBar';
import { XPReward } from '@/components/ui/XPReward';
import { Colors } from '@/constants/colors';
const DAILY_CHALLENGE_XP = 50;
import { Spacing } from '@/constants/spacing';
import { useConcept } from '@/hooks/useConcept';
import { useHaptics } from '@/hooks/useHaptics';
import { useProgress } from '@/hooks/useProgress';

const SLIDE_DURATION = 250;
const SLIDE_DISTANCE = 48;

export default function LessonPlayerScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const { slug, challenge } = useLocalSearchParams<{ slug: string; challenge?: string }>();
  const { concept, loading, error, retry } = useConcept(slug ?? null, 'cards');
  const progress = useProgress();

  const [cardIndex, setCardIndex] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Capture whether the lesson was already completed before this session.
  // useRef so it doesn't change when the progress context updates mid-session.
  const wasAlreadyCompleted = useRef(false);

  // 1 = forward (Continue), -1 = back. A shared value (not React state) so the
  // exiting card reads the direction chosen at press time, not at its last render.
  const direction = useSharedValue(1);

  const cardEntering = (values: EntryAnimationsValues): LayoutAnimation => {
    'worklet';
    return {
      initialValues: {
        opacity: 0,
        originX: values.targetOriginX + direction.value * SLIDE_DISTANCE,
      },
      animations: {
        opacity: withTiming(1, { duration: SLIDE_DURATION }),
        originX: withTiming(values.targetOriginX, { duration: SLIDE_DURATION }),
      },
    };
  };

  const cardExiting = (values: ExitAnimationsValues): LayoutAnimation => {
    'worklet';
    return {
      initialValues: {
        opacity: 1,
        originX: values.currentOriginX,
      },
      animations: {
        opacity: withTiming(0, { duration: SLIDE_DURATION }),
        originX: withTiming(values.currentOriginX - direction.value * SLIDE_DISTANCE, {
          duration: SLIDE_DURATION,
        }),
      },
    };
  };

  useEffect(() => {
    if (!concept) return;
    // Snapshot whether this lesson was already completed before the user started.
    const conceptProgress = progress.getConceptProgress(concept.id);
    wasAlreadyCompleted.current = conceptProgress.lessonStatus === 'completed';
    // Resume where the learner left off, then mark the lesson in progress.
    const resumeIndex = Math.min(
      conceptProgress.lessonCardIndex,
      concept.cards.length - 1,
    );
    setCardIndex(Math.max(resumeIndex, 0));
    progress.startLesson(concept.id);
    // Only run when the fetched concept changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concept?.id]);

  if (error) {
    return <ErrorState onRetry={retry} />;
  }

  if (loading || !concept) {
    return (
      <View style={styles.loader}>
        <LoadingScene fullscreen={false} />
      </View>
    );
  }

  if (completed) {
    const isChallenge = challenge === '1';
    const xp = wasAlreadyCompleted.current
      ? 0
      : concept.lesson_xp + (isChallenge ? DAILY_CHALLENGE_XP : 0);
    return (
      <XPReward
        xp={xp}
        subtitle={isChallenge ? 'Daily challenge complete' : 'Lesson complete'}
        onContinue={() => router.back()}
      />
    );
  }

  const isLastCard = cardIndex === concept.cards.length - 1;
  const isFirstCard = cardIndex === 0;

  const advance = () => {
    haptics.medium();
    direction.value = 1;
    if (isLastCard) {
      progress.completeLesson(concept.id, concept.lesson_xp);
      if (challenge === '1') {
        progress.completeDailyChallenge(DAILY_CHALLENGE_XP);
      }
      haptics.success();
      setCompleted(true);
    } else {
      const next = cardIndex + 1;
      setCardIndex(next);
      progress.setLessonCardIndex(concept.id, next);
    }
  };

  const goBack = () => {
    if (isFirstCard) return;
    direction.value = -1;
    const prev = cardIndex - 1;
    setCardIndex(prev);
    progress.setLessonCardIndex(concept.id, prev);
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Top bar: [X] [SegmentBar] [+XP] */}
      <View style={styles.topBar}>
        <Pressable
          hitSlop={12}
          onPress={() => {
            haptics.light();
            setShowExitModal(true);
          }}
        >
          <Feather name="x" size={24} color={Colors.textSecondary} />
        </Pressable>
        <SegmentBar total={concept.cards.length} completed={cardIndex + 1} style={styles.segments} />
        <AppText size="xs" weight="medium" color={Colors.accent}>
          +{concept.lesson_xp} XP
        </AppText>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LessonCard
          key={cardIndex}
          card={concept.cards[cardIndex]}
          entering={cardEntering}
          exiting={cardExiting}
        />
      </ScrollView>

      {/* Bottom: [Back] [Continue / Finish lesson] */}
      <View style={styles.bottom}>
        <GhostButton
          title="Back"
          icon="chevron-left"
          onPress={goBack}
          disabled={isFirstCard}
          style={styles.backButton}
        />
        <PrimaryButton
          title={isLastCard ? 'Finish lesson' : 'Continue'}
          onPress={advance}
          style={styles.continueButton}
        />
      </View>

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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
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
    justifyContent: 'center',
    padding: Spacing.padding.screen,
  },
  bottom: {
    flexDirection: 'row',
    gap: Spacing.gap.md,
    padding: Spacing.padding.screen,
    paddingBottom: 24,
  },
  backButton: {
    flex: 3,
  },
  continueButton: {
    flex: 7,
  },
});
