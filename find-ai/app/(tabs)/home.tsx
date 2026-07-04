import { useRouter } from 'expo-router';
import React from 'react';
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
import { StatPill } from '@/components/ui/StatPill';
import { Colors } from '@/constants/colors';
import { MOCK_DAILY_CHALLENGE, MOCK_LEAGUE } from '@/constants/mock-data';
import { Spacing } from '@/constants/spacing';
import { formatXP, greetingForTime } from '@/lib/gamification';
import { useConcept } from '@/hooks/useConcept';
import { useCourse } from '@/hooks/useCourse';
import { useCourses } from '@/hooks/useCourses';
import { useMockAuth } from '@/hooks/useMockAuth';
import { useMockLoading } from '@/hooks/useMockLoading';
import { useMockProgress } from '@/hooks/useMockProgress';
import { useNews } from '@/hooks/useNews';

export default function HomeScreen() {
  const router = useRouter();
  const loading = useMockLoading();
  const { displayName } = useMockAuth();
  const progress = useMockProgress();
  const { articles: newsArticles } = useNews('all');

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

  // Concept summaries in course order, used by the learning cards.
  const conceptSummaries = course ? course.modules.flatMap((m) => m.concepts) : [];

  // Resume card: first concept whose lesson is in progress.
  const resumeSummary = conceptSummaries.find(
    (c) => progress.getConceptProgress(c.id).lessonStatus === 'in_progress',
  );
  const {
    concept: resumeConcept,
    error: resumeError,
    retry: retryResume,
  } = useConcept(resumeSummary?.slug ?? null);
  const resumeProgress =
    resumeConcept && resumeConcept.cards.length > 0
      ? progress.getConceptProgress(resumeConcept.id).lessonCardIndex / resumeConcept.cards.length
      : 0;

  // Daily challenge: first concept the learner hasn't started, else the first.
  const challengeSummary =
    conceptSummaries.find(
      (c) => progress.getConceptProgress(c.id).lessonStatus === 'not_started',
    ) ?? conceptSummaries[0];

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
  const currentRank = MOCK_LEAGUE.users.find((u) => u.is_current_user)?.rank ?? 0;
  const daysUntilReset = Math.max(
    Math.ceil((new Date(MOCK_LEAGUE.week_end).getTime() - Date.now()) / 86_400_000),
    0,
  );

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

        <View style={styles.stack}>
          <DailyGoalCard completed={progress.dailyGoalCompleted} target={progress.dailyGoalTarget} />

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
            tier={MOCK_LEAGUE.tier}
            rank={currentRank}
            totalUsers={MOCK_LEAGUE.users.length}
            daysUntilReset={daysUntilReset}
            onPress={() => router.push('/league')}
          />

          {!learningError && !progress.dailyChallengeCompleted && challengeSummary ? (
            <DailyChallengeCard
              lessonTitle={challengeSummary.title}
              xpReward={MOCK_DAILY_CHALLENGE.xp_reward}
              onStart={() => router.push(`/lesson/${challengeSummary.slug}?challenge=1`)}
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
  stack: {
    marginTop: Spacing.gap.xl,
    gap: Spacing.gap.md,
  },
});
