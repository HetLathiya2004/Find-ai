import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { BackRow } from '@/components/ui/BackRow';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { MasteryDots } from '@/components/ui/MasteryDots';
import { Colors } from '@/constants/colors';
import {
  getConceptBySlug,
  getLessonByConceptId,
  getQuizByConceptId,
  getSimulationByConceptId,
} from '@/constants/mock-data';
import { Spacing } from '@/constants/spacing';
import { masteryLabel } from '@/lib/gamification';
import { useHaptics } from '@/hooks/useHaptics';
import { ActivityStatus, useMockProgress } from '@/hooks/useMockProgress';

function StatusChip({ status, score }: { status: ActivityStatus; score?: number | null }) {
  if (status === 'completed') {
    return (
      <Chip color={Colors.accent} backgroundColor={Colors.accentMuted + '40'}>
        {score != null ? `Passed — ${score}%` : 'Complete'}
      </Chip>
    );
  }
  if (status === 'in_progress') {
    return (
      <Chip color={Colors.warning} backgroundColor={Colors.warningMuted + '40'}>
        In Progress
      </Chip>
    );
  }
  return <Chip color={Colors.textSecondary}>Start</Chip>;
}

interface PathwayRowProps {
  icon: React.ReactNode;
  title: string;
  xp: number;
  status: ActivityStatus;
  score?: number | null;
  locked: boolean;
  divider: boolean;
  onPress: () => void;
}

function PathwayRow({ icon, title, xp, status, score, locked, divider, onPress }: PathwayRowProps) {
  const haptics = useHaptics();
  return (
    <Pressable
      disabled={locked}
      style={[styles.row, divider && styles.rowDivider, locked && styles.rowLocked]}
      onPress={() => {
        haptics.light();
        onPress();
      }}
    >
      <View style={styles.rowLeft}>
        {icon}
        <AppText size="base">{title}</AppText>
      </View>
      <View style={styles.rowRight}>
        <AppText size="xs" color={Colors.accent}>
          +{xp} XP
        </AppText>
        {locked ? <Feather name="lock" size={16} color={Colors.textFaint} /> : <StatusChip status={status} score={score} />}
      </View>
    </Pressable>
  );
}

export default function ConceptDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const concept = getConceptBySlug(slug ?? '');
  const { getConceptProgress } = useMockProgress();

  if (!concept) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.content}>
          <BackRow />
          <AppText size="base" color={Colors.textSecondary} style={{ marginTop: 20 }}>
            Concept not found.
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  const lesson = getLessonByConceptId(concept.id);
  const quiz = getQuizByConceptId(concept.id);
  const simulation = getSimulationByConceptId(concept.id);
  const cp = getConceptProgress(concept.id);

  const quizLocked = cp.lessonStatus !== 'completed';
  const simLocked = !cp.quizPassed;

  const iconColor = (locked: boolean) => (locked ? Colors.textFaint : Colors.textPrimary);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackRow />
        <AppText size="2xl" weight="medium" style={styles.title}>
          {concept.title}
        </AppText>
        <AppText size="sm" color={Colors.textSecondary} style={styles.description} leading="relaxed">
          {concept.description}
        </AppText>

        <Card padding="none" style={styles.pathway}>
          {lesson ? (
            <PathwayRow
              icon={<Feather name="book-open" size={20} color={iconColor(false)} />}
              title="Lesson"
              xp={lesson.xp_reward}
              status={cp.lessonStatus}
              locked={false}
              divider={false}
              onPress={() => router.push(`/lesson/${lesson.slug}`)}
            />
          ) : null}
          {quiz ? (
            <PathwayRow
              icon={<MaterialCommunityIcons name="brain" size={20} color={iconColor(quizLocked)} />}
              title="Quiz"
              xp={quiz.xp_reward}
              status={cp.quizStatus}
              score={cp.quizStatus === 'completed' ? cp.quizBestScore : undefined}
              locked={quizLocked}
              divider
              onPress={() => router.push(`/quiz/${quiz.id}`)}
            />
          ) : null}
          {simulation ? (
            <PathwayRow
              icon={<MaterialCommunityIcons name="gamepad-variant" size={20} color={iconColor(simLocked)} />}
              title="Simulation"
              xp={simulation.xp_reward}
              status={cp.simulationStatus}
              locked={simLocked}
              divider
              onPress={() => router.push(`/simulation/${simulation.id}`)}
            />
          ) : null}
        </Card>

        <View style={styles.mastery}>
          <MasteryDots level={concept.mastery_level} />
          <AppText size="sm" color={Colors.textSecondary} style={styles.masteryLabel}>
            {masteryLabel(concept.mastery_level)} — Level {concept.mastery_level} of 5
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: Spacing.padding.screen,
    paddingBottom: Spacing.bottomOffset,
  },
  title: {
    marginTop: Spacing.gap.xl,
  },
  description: {
    marginTop: Spacing.gap.sm,
  },
  pathway: {
    marginTop: Spacing.gap['2xl'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.padding.card,
    paddingVertical: 18,
    gap: Spacing.gap.sm,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderDefault,
  },
  rowLocked: {
    opacity: 0.4,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap.md,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap.md,
  },
  mastery: {
    marginTop: Spacing.gap.xl,
    gap: Spacing.gap.sm,
  },
  masteryLabel: {
    marginTop: 2,
  },
});
