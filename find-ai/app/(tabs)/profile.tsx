import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BadgeGrid } from '@/components/profile/BadgeGrid';
import { MasteryList } from '@/components/profile/MasteryList';
import { StatsGrid } from '@/components/profile/StatsGrid';
import { ThemeSettingRow } from '@/components/profile/ThemeSettingRow';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/ui/FormInput';
import { LoadingScene } from '@/components/ui/LoadingScene';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tag } from '@/components/ui/Tag';
import { Spacing } from '@/constants/spacing';
import { deriveBadges } from '@/lib/badges';
import { formatXP, levelForXP, masteryFromActivities, xpForNextLevel } from '@/lib/gamification';
import { useCourse } from '@/hooks/useCourse';
import { useCourses } from '@/hooks/useCourses';
import { useHaptics } from '@/hooks/useHaptics';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { type ColorPalette, useColors } from '@/theme';
import { toMockConcept } from '@/types/api';

const GOAL_LABELS: Record<string, string> = {
  grow_wealth: 'Growing my wealth',
  understand_news: 'Understanding the news',
  learn_basics: 'Learning the basics',
};

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
    content: {
      padding: Spacing.padding.screen,
      paddingBottom: Spacing.bottomOffset,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: Spacing.gap['2xl'],
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.gap.md,
    },
    name: {
      marginBottom: 2,
    },
    levelCard: {
      marginTop: Spacing.gap.md,
    },
    levelBar: {
      marginTop: Spacing.gap.md,
      marginBottom: Spacing.gap.sm,
    },
    sectionTag: {
      marginTop: Spacing.gap['2xl'],
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.padding.card,
      paddingVertical: 16,
      gap: Spacing.gap.md,
    },
    settingDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.borderDefault,
    },
    nameInput: {
      flex: 1,
      maxWidth: 200,
      height: 40,
    },
  });
}

export default function ProfileScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { displayName, goal, dailyGoalMinutes, updateDisplayName, cycleDailyGoal, signOut } =
    useAuth();
  const { xp, streakCount, streakBest, getConceptProgress } = useProgress();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(displayName);

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const { courses, loading: coursesLoading } = useCourses();
  useEffect(() => {
    if (!selectedCourseId && courses.length > 0) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);
  const { course, loading: courseLoading } = useCourse(selectedCourseId);

  const masteredConcepts = useMemo(() => {
    if (!course) return [];
    return course.modules
      .flatMap((module) =>
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
      )
      .sort((a, b) => b.mastery_level - a.mastery_level);
  }, [course, getConceptProgress]);

  const badges = useMemo(() => {
    let lessonsCompleted = 0;
    let bestQuizScore = 0;
    let simulationsCompleted = 0;
    let marketsMastered = 0;
    let marketsTotal = 0;

    for (const module of course?.modules ?? []) {
      for (const concept of module.concepts) {
        const cp = getConceptProgress(concept.id);
        const lessonDone = cp.lessonStatus === 'completed';
        const simDone = cp.simulationStatus === 'completed';
        if (lessonDone) lessonsCompleted += 1;
        if (simDone) simulationsCompleted += 1;
        bestQuizScore = Math.max(bestQuizScore, cp.quizBestScore ?? 0);
        if (module.domain === 'markets') {
          marketsTotal += 1;
          if (lessonDone && cp.quizPassed && simDone) marketsMastered += 1;
        }
      }
    }

    return deriveBadges({
      lessonsCompleted,
      bestQuizScore,
      simulationsCompleted,
      streak: Math.max(streakCount, streakBest),
      marketsMastered,
      marketsTotal,
    });
  }, [course, getConceptProgress, streakCount, streakBest]);

  if (coursesLoading || courseLoading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.loader}>
          <LoadingScene fullscreen={false} />
        </View>
      </SafeAreaView>
    );
  }

  const level = levelForXP(xp);
  const levelInfo = xpForNextLevel(xp);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <AppText size="2xl" weight="bold" color={colors.textPrimary}>
              {displayName.charAt(0).toUpperCase()}
            </AppText>
          </View>
          <AppText size="xl" weight="medium" style={styles.name}>
            {displayName}
          </AppText>
          <AppText size="sm" color={colors.textSecondary}>
            {GOAL_LABELS[goal] ?? goal}
          </AppText>
        </View>

        <StatsGrid
          stats={[
            { label: 'XP', value: formatXP(xp) },
            { label: 'Level', value: level },
            { label: 'Streak', value: streakCount },
          ]}
        />

        <Card style={styles.levelCard}>
          <AppText size="base" weight="medium">
            Level {level}
          </AppText>
          <ProgressBar progress={levelInfo.progress} height={4} style={styles.levelBar} />
          <AppText size="xs" color={colors.textSecondary}>
            {levelInfo.toNext} XP to Level {level + 1}
          </AppText>
        </Card>

        <Tag style={styles.sectionTag}>Badges</Tag>
        <BadgeGrid badges={badges} />

        <Tag style={styles.sectionTag}>Concept mastery</Tag>
        {masteredConcepts.length > 0 ? (
          <MasteryList concepts={masteredConcepts.slice(0, 6)} />
        ) : (
          <Card>
            <AppText size="sm" color={colors.textSecondary}>
              Start learning to build concept mastery.
            </AppText>
          </Card>
        )}

        <Tag style={styles.sectionTag}>Settings</Tag>
        <Card padding="none">
          <View style={styles.settingRow}>
            <AppText size="sm" color={colors.textSecondary}>
              Display name
            </AppText>
            {editingName ? (
              <FormInput
                value={nameDraft}
                onChangeText={setNameDraft}
                autoFocus
                onBlur={() => {
                  updateDisplayName(nameDraft);
                  setEditingName(false);
                }}
                onSubmitEditing={() => {
                  updateDisplayName(nameDraft);
                  setEditingName(false);
                }}
                style={styles.nameInput}
              />
            ) : (
              <Pressable
                onPress={() => {
                  haptics.light();
                  setNameDraft(displayName);
                  setEditingName(true);
                }}
              >
                <AppText size="base">{displayName}</AppText>
              </Pressable>
            )}
          </View>

          <Pressable
            style={[styles.settingRow, styles.settingDivider]}
            onPress={() => {
              haptics.light();
              cycleDailyGoal();
            }}
          >
            <AppText size="sm" color={colors.textSecondary}>
              Daily goal
            </AppText>
            <AppText size="base">{dailyGoalMinutes} min/day</AppText>
          </Pressable>

          <ThemeSettingRow style={styles.settingDivider} />

          <Pressable
            style={[styles.settingRow, styles.settingDivider]}
            onPress={() => {
              haptics.warning();
              signOut();
              router.replace('/(auth)/welcome');
            }}
          >
            <AppText size="base" color={colors.danger}>
              Sign out
            </AppText>
          </Pressable>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
