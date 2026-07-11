import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ComingSoonCard } from '@/components/learn/ComingSoonCard';
import { ConceptCard } from '@/components/learn/ConceptCard';
import { DomainFilter, DomainFilterValue } from '@/components/learn/DomainFilter';
import { AppText } from '@/components/ui/AppText';
import { LoadingScene } from '@/components/ui/LoadingScene';
import { ErrorState } from '@/components/ui/ErrorState';
import { Mascot } from '@/components/ui/Mascot';
import { Spacing } from '@/constants/spacing';
import { masteryFromActivities } from '@/lib/gamification';
import { useCourse } from '@/hooks/useCourse';
import { useCourses } from '@/hooks/useCourses';
import { useHaptics } from '@/hooks/useHaptics';
import { useProgress } from '@/hooks/useProgress';
import type { MockConcept } from '@/constants/mock-data';
import type { ApiCourseSummary } from '@/types/api';
import { toMockConcept } from '@/types/api';
import { type ColorPalette, useColors } from '@/theme';

/** Concept row enriched with the parent module's coming-soon flag. */
type LearnConcept = MockConcept & { comingSoon: boolean };

interface CoursePickerProps {
  courses: ApiCourseSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.bg,
    },
    title: {
      padding: Spacing.padding.screen,
    },
    filters: {
      paddingBottom: Spacing.padding.screen,
    },
    list: {
      paddingHorizontal: Spacing.padding.screen,
      paddingBottom: Spacing.bottomOffset,
    },
    empty: {
      paddingHorizontal: Spacing.padding.screen,
      alignItems: 'center',
      paddingTop: Spacing.gap['2xl'],
    },
    emptyCopy: {
      marginTop: Spacing.gap.xs,
    },
    coursePicker: {
      paddingHorizontal: Spacing.padding.screen,
      gap: Spacing.gap.sm,
    },
    coursePill: {
      borderRadius: Spacing.radius.full,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
    },
    coursePillActive: {
      backgroundColor: colors.surface2,
      borderColor: colors.textPrimary,
    },
    coursePillInactive: {
      backgroundColor: colors.surface1,
      borderColor: colors.borderDefault,
    },
  });
}

/** Horizontal pill picker, shown only when more than one course is published. */
function CoursePicker({ courses, selectedId, onSelect }: CoursePickerProps) {
  const haptics = useHaptics();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.coursePicker}
    >
      {courses.map((course) => {
        const isActive = course.id === selectedId;
        return (
          <Pressable
            key={course.id}
            style={[styles.coursePill, isActive ? styles.coursePillActive : styles.coursePillInactive]}
            onPress={() => {
              haptics.light();
              onSelect(course.id);
            }}
          >
            <AppText
              size="sm"
              weight={isActive ? 'medium' : 'regular'}
              color={isActive ? colors.textPrimary : colors.textSecondary}
            >
              {course.icon_emoji} {course.title}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default function LearnScreen() {
  const router = useRouter();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [filter, setFilter] = useState<DomainFilterValue>('all');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
    retry: retryCourses,
  } = useCourses();

  // Auto-select the only (or first) course once the list arrives.
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

  const concepts = useMemo<LearnConcept[]>(() => {
    if (!course) return [];
    return course.modules.flatMap((module) =>
      module.concepts.map((concept) => {
        const cp = getConceptProgress(concept.id);
        return {
          ...toMockConcept(
            concept,
            module.domain,
            masteryFromActivities(
              cp.lessonStatus === 'completed',
              cp.quizPassed,
              cp.simulationStatus === 'completed',
            ),
          ),
          comingSoon: module.is_coming_soon === true,
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
          <LoadingScene fullscreen={false} />
        </View>
      </SafeAreaView>
    );
  }

  if (courses.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <AppText size="2xl" weight="medium" style={styles.title}>
          Learn
        </AppText>
        <View style={styles.empty}>
          <Mascot pose="think" size={132} animate="bounce" />
          <AppText size="base" weight="bold" center>
            Your next course is being polished
          </AppText>
          <AppText size="sm" color={colors.textSecondary} center style={styles.emptyCopy}>
            Buck will let you know when it&apos;s ready.
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  const filtered = filter === 'all' ? concepts : concepts.filter((c) => c.domain === filter);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <AppText size="2xl" weight="medium" style={styles.title}>
        Learn
      </AppText>
      {courses.length > 1 ? (
        <View style={styles.filters}>
          <CoursePicker courses={courses} selectedId={selectedCourseId} onSelect={setSelectedCourseId} />
        </View>
      ) : null}
      <View style={styles.filters}>
        <DomainFilter selected={filter} onSelect={setFilter} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.gap.md }} />}
        renderItem={({ item }) =>
          item.comingSoon ? (
            <ComingSoonCard concept={item} />
          ) : (
            <ConceptCard
              concept={item}
              masteryLevel={item.mastery_level}
              onPress={() => router.push(`/(tabs)/learn/${item.slug}`)}
            />
          )
        }
      />
    </SafeAreaView>
  );
}
