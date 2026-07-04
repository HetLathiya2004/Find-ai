import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConceptCard } from '@/components/learn/ConceptCard';
import { DomainFilter, DomainFilterValue } from '@/components/learn/DomainFilter';
import { AppText } from '@/components/ui/AppText';
import { ErrorState } from '@/components/ui/ErrorState';
import { ScreenSkeleton } from '@/components/ui/SkeletonLoader';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { masteryFromActivities } from '@/lib/gamification';
import { useCourse } from '@/hooks/useCourse';
import { useCourses } from '@/hooks/useCourses';
import { useHaptics } from '@/hooks/useHaptics';
import { useMockProgress } from '@/hooks/useMockProgress';
import type { ApiCourseSummary } from '@/types/api';
import { toMockConcept } from '@/types/api';

interface CoursePickerProps {
  courses: ApiCourseSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** Horizontal pill picker, shown only when more than one course is published. */
function CoursePicker({ courses, selectedId, onSelect }: CoursePickerProps) {
  const haptics = useHaptics();
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
              color={isActive ? Colors.textPrimary : Colors.textSecondary}
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

  const { getConceptProgress } = useMockProgress();

  const concepts = useMemo(() => {
    if (!course) return [];
    return course.modules.flatMap((module) =>
      module.concepts.map((concept) => {
        const cp = getConceptProgress(concept.id);
        return toMockConcept(
          concept,
          module.domain,
          masteryFromActivities(
            cp.lessonStatus === 'completed',
            cp.quizPassed,
            cp.simulationStatus === 'completed',
          ),
        );
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
        <ScreenSkeleton rows={5} />
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
          <AppText size="sm" color={Colors.textSecondary}>
            No courses available yet. Check back soon.
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
        renderItem={({ item }) => (
          <ConceptCard
            concept={item}
            masteryLevel={item.mastery_level}
            onPress={() => router.push(`/(tabs)/learn/${item.slug}`)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
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
    backgroundColor: Colors.surface2,
    borderColor: Colors.textPrimary,
  },
  coursePillInactive: {
    backgroundColor: Colors.surface1,
    borderColor: Colors.borderDefault,
  },
});
