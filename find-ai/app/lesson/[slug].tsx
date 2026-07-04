import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExitModal } from '@/components/lesson/ExitModal';
import { LessonCard } from '@/components/lesson/LessonCard';
import { AppText } from '@/components/ui/AppText';
import { ErrorState } from '@/components/ui/ErrorState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SegmentBar } from '@/components/ui/SegmentBar';
import { ScreenSkeleton } from '@/components/ui/SkeletonLoader';
import { XPReward } from '@/components/ui/XPReward';
import { Colors } from '@/constants/colors';
import { MOCK_DAILY_CHALLENGE } from '@/constants/mock-data';
import { Spacing } from '@/constants/spacing';
import { useConcept } from '@/hooks/useConcept';
import { useHaptics } from '@/hooks/useHaptics';
import { useMockProgress } from '@/hooks/useMockProgress';

export default function LessonPlayerScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const { slug, challenge } = useLocalSearchParams<{ slug: string; challenge?: string }>();
  const { concept, loading, error, retry } = useConcept(slug ?? null);
  const progress = useMockProgress();

  const [cardIndex, setCardIndex] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!concept) return;
    // Resume where the learner left off, then mark the lesson in progress.
    const resumeIndex = Math.min(
      progress.getConceptProgress(concept.id).lessonCardIndex,
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
      <SafeAreaView style={styles.screen}>
        <ScreenSkeleton rows={3} />
      </SafeAreaView>
    );
  }

  if (completed) {
    const isChallenge = challenge === '1';
    const xp = concept.lesson_xp + (isChallenge ? MOCK_DAILY_CHALLENGE.xp_reward : 0);
    return (
      <XPReward
        xp={xp}
        subtitle={isChallenge ? 'Daily challenge complete' : 'Lesson complete'}
        onContinue={() => router.back()}
      />
    );
  }

  const isLastCard = cardIndex === concept.cards.length - 1;

  const advance = () => {
    haptics.medium();
    if (isLastCard) {
      progress.completeLesson(concept.id, concept.lesson_xp);
      if (challenge === '1') {
        progress.completeDailyChallenge(MOCK_DAILY_CHALLENGE.xp_reward);
      }
      haptics.success();
      setCompleted(true);
    } else {
      const next = cardIndex + 1;
      setCardIndex(next);
      progress.setLessonCardIndex(concept.id, next);
    }
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
        <LessonCard card={concept.cards[cardIndex]} />
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottom}>
        <PrimaryButton title={isLastCard ? 'Finish lesson' : 'Tap to continue'} onPress={advance} />
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
    padding: Spacing.padding.screen,
    paddingBottom: 24,
  },
});
