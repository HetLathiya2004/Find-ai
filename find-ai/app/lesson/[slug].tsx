import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExitModal } from '@/components/lesson/ExitModal';
import { LessonCard } from '@/components/lesson/LessonCard';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SegmentBar } from '@/components/ui/SegmentBar';
import { XPReward } from '@/components/ui/XPReward';
import { Colors } from '@/constants/colors';
import { getLessonBySlug, MOCK_DAILY_CHALLENGE } from '@/constants/mock-data';
import { Spacing } from '@/constants/spacing';
import { useHaptics } from '@/hooks/useHaptics';
import { useMockProgress } from '@/hooks/useMockProgress';

export default function LessonPlayerScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const { slug, challenge } = useLocalSearchParams<{ slug: string; challenge?: string }>();
  const lesson = getLessonBySlug(slug ?? '');
  const progress = useMockProgress();

  const startIndex = lesson
    ? Math.min(progress.getConceptProgress(lesson.concept_id).lessonCardIndex, lesson.cards.length - 1)
    : 0;

  const [cardIndex, setCardIndex] = useState(startIndex);
  const [showExitModal, setShowExitModal] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (lesson) progress.startLesson(lesson.concept_id);
    // Only run on mount for this lesson.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  if (!lesson) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <AppText size="base" color={Colors.textSecondary}>
            Lesson not found.
          </AppText>
          <PrimaryButton title="Go back" onPress={() => router.back()} style={{ marginTop: 20 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (completed) {
    const isChallenge = challenge === '1';
    const xp = lesson.xp_reward + (isChallenge ? MOCK_DAILY_CHALLENGE.xp_reward : 0);
    return (
      <XPReward
        xp={xp}
        subtitle={isChallenge ? 'Daily challenge complete' : 'Lesson complete'}
        onContinue={() => router.back()}
      />
    );
  }

  const isLastCard = cardIndex === lesson.cards.length - 1;

  const advance = () => {
    haptics.medium();
    if (isLastCard) {
      progress.completeLesson(lesson.concept_id, lesson.xp_reward);
      if (challenge === '1') {
        progress.completeDailyChallenge(MOCK_DAILY_CHALLENGE.xp_reward);
      }
      haptics.success();
      setCompleted(true);
    } else {
      const next = cardIndex + 1;
      setCardIndex(next);
      progress.setLessonCardIndex(lesson.concept_id, next);
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
        <SegmentBar total={lesson.cards.length} completed={cardIndex + 1} style={styles.segments} />
        <AppText size="xs" weight="medium" color={Colors.accent}>
          +{lesson.xp_reward} XP
        </AppText>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LessonCard card={lesson.cards[cardIndex]} />
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
    justifyContent: 'center',
    padding: Spacing.padding.screen,
  },
  bottom: {
    padding: Spacing.padding.screen,
    paddingBottom: 24,
  },
});
