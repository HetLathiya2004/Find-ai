import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyChallengeCard } from '@/components/home/DailyChallengeCard';
import { DailyGoalCard } from '@/components/home/DailyGoalCard';
import { LeagueCard } from '@/components/home/LeagueCard';
import { NewsCard } from '@/components/home/NewsCard';
import { ResumeCard } from '@/components/home/ResumeCard';
import { AppText } from '@/components/ui/AppText';
import { DollarLoader } from '@/components/ui/DollarLoader';
import { ErrorState } from '@/components/ui/ErrorState';
import { Mascot } from '@/components/ui/Mascot';
import { StatPill } from '@/components/ui/StatPill';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { formatXP, greetingForTime } from '@/lib/gamification';
import { useConcept } from '@/hooks/useConcept';
import { useCourse } from '@/hooks/useCourse';
import { useCourses } from '@/hooks/useCourses';
import { useAuth } from '@/hooks/useAuth';
import { useDailyGoal } from '@/hooks/useDailyGoal';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useMockLoading } from '@/hooks/useMockLoading';
import { useProgress } from '@/hooks/useProgress';
import { useNews } from '@/hooks/useNews';

const DAILY_CHALLENGE_XP = 50;

export default function HomeScreen() {
  const router = useRouter();
  const loading = useMockLoading();
  const { displayName } = useAuth();
  const progress = useProgress();
  const { articles: newsArticles } = useNews('all');
  const dailyGoal = useDailyGoal();
  const { leaderboard, refresh: refreshLeaderboard } = useLeaderboard();
  const refreshDailyGoal = dailyGoal.refresh;

  // Rank and goal progress change while the user is off in lessons/quizzes —
  // re-sync (silently) every time the home tab regains focus so the cards
  // never show stale numbers.
  useFocusEffect(
    useCallback(() => {
      refreshLeaderboard();
      refreshDailyGoal();
    }, [refreshLeaderboard, refreshDailyGoal]),
  );

  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
    retry: retryCourses,
  } = useCourses();
  const firstCourseId = courses.length > 0 ? courses[0].id : null;
  const {
    course,
    loading: courseLoading,
    error: courseError,
    retry: retryCourse,
  } = useCourse(firstCourseId);

  const conceptSummaries = course ? course.modules.flatMap((m) => m.concepts) : [];

  const resumeSummary = conceptSummaries.find(
    (c) => progress.getConceptProgress(c.id).lessonStatus === 'in_progress',
  );
  const {
    concept: resumeConcept,
    error: resumeError,
    retry: retryResume,
  } = useConcept(resumeSummary?.slug ?? null);
  const resumeProgress =
    resumeConcept && resumeConcept.card_count > 0
      ? progress.getConceptProgress(resumeConcept.id).lessonCardIndex / resumeConcept.card_count
      : 0;

  const challengeSummary = conceptSummaries.find(
    (c) => progress.getConceptProgress(c.id).lessonStatus === 'completed',
  );

  const learningError = coursesError || courseError || resumeError;
  const retryLearning = () => {
    if (coursesError) retryCourses();
    if (courseError) retryCourse();
    if (resumeError) retryResume();
  };

  if (loading || coursesLoading || courseLoading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.loader}>
          <DollarLoader />
        </View>
      </SafeAreaView>
    );
  }

  const topNews = newsArticles.find((n) => !progress.readNewsIds.includes(n.id));

  const currentRank = leaderboard?.current_user_rank ?? 0;
  const tier = leaderboard?.current_user_tier ?? 'Bronze';
  const totalUsers = leaderboard?.users.length ?? 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <AppText size="sm" color={Colors.textSecondary}>
              {greetingForTime()},
            </AppText>
            <AppText size="xl" weight="medium">
              {displayName}
            </AppText>
          </View>
          <View style={styles.pills}>
            <StatPill
              emoji="🔥"
              value={progress.streakCount}
              valueColor={Colors.warning}
              onPress={() => router.push('/streak')}
            />
            <StatPill emoji="⚡" value={formatXP(progress.xp)} valueColor={Colors.accent} />
          </View>
        </View>

        <View style={styles.coachCard}>
          <Mascot pose="encourage" size={84} animate="entrance" />
          <View style={styles.coachCopy}>
            <AppText size="base" weight="bold">
              Ready for a quick money win?
            </AppText>
            <AppText size="sm" color={Colors.textSecondary} style={styles.coachSubtitle}>
              Pick up where you left off or finish today&apos;s goal.
            </AppText>
          </View>
        </View>

        <View style={styles.stack}>
          <DailyGoalCard
            completed={dailyGoal.completed}
            target={dailyGoal.target}
            xpEarned={dailyGoal.xpEarned}
            loading={dailyGoal.loading}
          />

          {learningError ? (
            <ErrorState onRetry={retryLearning} />
          ) : resumeSummary && resumeConcept ? (
            <ResumeCard
              lessonTitle={resumeConcept.lesson_title}
              progress={resumeProgress}
              xpReward={resumeConcept.lesson_xp}
              onContinue={() => router.push(`/lesson/${resumeConcept.slug}`)}
            />
          ) : null}

          {topNews ? (
            <NewsCard
              headline={topNews.title}
              conceptTitle={topNews.concept_title}
              xpReward={topNews.xp_reward}
              onPress={() => router.push('/(tabs)/news')}
            />
          ) : null}

          <LeagueCard
            tier={tier}
            rank={currentRank}
            totalUsers={totalUsers}
            onPress={() => router.push('/league')}
          />

          {!learningError && !progress.dailyChallengeCompleted && challengeSummary ? (
            <DailyChallengeCard
              lessonTitle={challengeSummary.title}
              xpReward={DAILY_CHALLENGE_XP}
              onStart={() => router.push(`/quiz/${challengeSummary.slug}`)}
            />
          ) : null}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pills: {
    flexDirection: 'row',
    gap: Spacing.gap.sm,
  },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap.md,
    marginTop: Spacing.gap.lg,
    paddingRight: Spacing.padding.card,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Spacing.radius.card,
    overflow: 'hidden',
  },
  coachCopy: {
    flex: 1,
  },
  coachSubtitle: {
    marginTop: 2,
  },
  stack: {
    marginTop: Spacing.gap.md,
    gap: Spacing.gap.md,
  },
});
