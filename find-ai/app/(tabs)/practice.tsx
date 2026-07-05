import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { DollarLoader } from '@/components/ui/DollarLoader';
import { ErrorState } from '@/components/ui/ErrorState';
import { Tag } from '@/components/ui/Tag';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { domainLabel, masteryFromActivities, masteryLabel } from '@/lib/gamification';
import { useCourse } from '@/hooks/useCourse';
import { useCourses } from '@/hooks/useCourses';
import { useHaptics } from '@/hooks/useHaptics';
import { useProgress } from '@/hooks/useProgress';
import type { Domain } from '@/constants/mock-data';

const REVIEW_XP = 15;

interface PracticeConcept {
  id: string;
  title: string;
  slug: string;
  domain: Domain;
  mastery: number;
  simulationCompleted: boolean;
}

export default function PracticeScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
    retry: retryCourses,
  } = useCourses();

  useEffect(() => {
    if (!selectedCourseId && courses.length > 0) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const {
    course,
    loading: courseLoading,
    error: courseError,
    retry: retryCourse,
  } = useCourse(selectedCourseId);

  const { getConceptProgress } = useProgress();

  const concepts = useMemo<PracticeConcept[]>(() => {
    if (!course) return [];
    return course.modules
      .filter((module) => module.is_coming_soon !== true)
      .flatMap((module) =>
        module.concepts.map((concept) => {
          const cp = getConceptProgress(concept.id);
          return {
            id: concept.id,
            title: concept.title,
            slug: concept.slug,
            domain: module.domain,
            mastery: masteryFromActivities(
              cp.lessonStatus === 'completed',
              cp.quizPassed,
              cp.simulationStatus === 'completed',
            ),
            simulationCompleted: cp.simulationStatus === 'completed',
          };
        }),
      );
  }, [course, getConceptProgress]);

  if (coursesError) {
    return <ErrorState onRetry={retryCourses} />;
  }
  if (courseError) {
    return <ErrorState onRetry={retryCourse} />;
  }

  if (coursesLoading || courseLoading || (courses.length > 0 && !course)) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.loader}>
          <DollarLoader />
        </View>
      </SafeAreaView>
    );
  }

  // Due for review: learned but not mastered (mastery 2-4)
  const dueForReview = concepts.filter((c) => c.mastery >= 2 && c.mastery <= 4);
  // Weak concepts: just started (mastery 1)
  const weakConcepts = concepts.filter((c) => c.mastery === 1);
  // Simulations not yet completed
  const simulations = concepts.filter((c) => !c.simulationCompleted).slice(0, 4);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText size="2xl" weight="medium" style={styles.title}>
          Practice
        </AppText>

        {/* Due for Review */}
        <Tag>Due for review</Tag>
        {dueForReview.length > 0 ? (
          <Card padding="none" style={styles.sectionCard}>
            {dueForReview.map((concept, i) => (
              <Pressable
                key={concept.id}
                style={[styles.row, i > 0 && styles.divider]}
                onPress={() => {
                  haptics.light();
                  router.push(`/quiz/${concept.slug}`);
                }}
              >
                <AppText size="base" style={styles.rowTitle}>
                  {concept.title}
                </AppText>
                <AppText size="xs" color={Colors.accent}>
                  Review — +{REVIEW_XP} XP
                </AppText>
                <Feather name="chevron-right" size={16} color={Colors.textMuted} />
              </Pressable>
            ))}
          </Card>
        ) : (
          <Card style={styles.sectionCard}>
            <AppText size="sm" color={Colors.textSecondary}>
              Nothing due for review. Keep learning!
            </AppText>
          </Card>
        )}

        {/* Weak Concepts */}
        <Tag style={styles.sectionTag}>Needs practice</Tag>
        {weakConcepts.length > 0 ? (
          <Card padding="none" style={styles.sectionCard}>
            {weakConcepts.map((concept, i) => (
              <Pressable
                key={concept.id}
                style={[styles.row, i > 0 && styles.divider]}
                onPress={() => {
                  haptics.light();
                  router.push(`/(tabs)/learn/${concept.slug}`);
                }}
              >
                <AppText size="base" style={styles.rowTitle}>
                  {concept.title}
                </AppText>
                <AppText size="xs" color={Colors.warning}>
                  {masteryLabel(concept.mastery)} — Level {concept.mastery}
                </AppText>
              </Pressable>
            ))}
          </Card>
        ) : (
          <Card style={styles.sectionCard}>
            <AppText size="sm" color={Colors.textSecondary}>
              No weak concepts right now. Nice work!
            </AppText>
          </Card>
        )}

        {/* Simulations */}
        <Tag style={styles.sectionTag}>Try a simulation</Tag>
        {simulations.length > 0 ? (
          <Card padding="none" style={styles.sectionCard}>
            {simulations.map((concept, i) => (
              <Pressable
                key={concept.id}
                style={[styles.simRow, i > 0 && styles.divider]}
                onPress={() => {
                  haptics.light();
                  router.push(`/simulation/${concept.slug}`);
                }}
              >
                <View style={styles.simInfo}>
                  <AppText size="base" style={styles.simTitle}>
                    {concept.title}
                  </AppText>
                  <Chip>{domainLabel(concept.domain)}</Chip>
                </View>
                <Feather name="chevron-right" size={16} color={Colors.textMuted} />
              </Pressable>
            ))}
          </Card>
        ) : (
          <Card style={styles.sectionCard}>
            <AppText size="sm" color={Colors.textSecondary}>
              All simulations completed. Impressive!
            </AppText>
          </Card>
        )}
      </ScrollView>
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
  content: {
    padding: Spacing.padding.screen,
    paddingBottom: Spacing.bottomOffset,
  },
  title: {
    marginBottom: Spacing.gap.xl,
  },
  sectionCard: {
    marginBottom: Spacing.gap.sm,
  },
  sectionTag: {
    marginTop: Spacing.gap.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap.md,
    paddingHorizontal: Spacing.padding.card,
    paddingVertical: 16,
  },
  rowTitle: {
    flex: 1,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderDefault,
  },
  simRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap.md,
    paddingHorizontal: Spacing.padding.card,
    paddingVertical: 16,
  },
  simInfo: {
    flex: 1,
    gap: 6,
  },
  simTitle: {
    marginBottom: 2,
  },
});
