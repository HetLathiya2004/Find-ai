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
import { ScreenSkeleton } from '@/components/ui/SkeletonLoader';
import { StatPill } from '@/components/ui/StatPill';
import { Colors } from '@/constants/colors';
import {
  MOCK_DAILY_CHALLENGE,
  MOCK_LEAGUE,
  MOCK_LESSONS,
  MOCK_NEWS,
} from '@/constants/mock-data';
import { Spacing } from '@/constants/spacing';
import { formatXP, greetingForTime } from '@/lib/gamification';
import { useMockAuth } from '@/hooks/useMockAuth';
import { useMockLoading } from '@/hooks/useMockLoading';
import { useMockProgress } from '@/hooks/useMockProgress';

export default function HomeScreen() {
  const router = useRouter();
  const loading = useMockLoading();
  const { displayName } = useMockAuth();
  const progress = useMockProgress();

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScreenSkeleton rows={4} />
      </SafeAreaView>
    );
  }

  // Resume card: first lesson that is in progress
  const inProgressEntry = Object.entries(progress.concepts).find(
    ([, p]) => p.lessonStatus === 'in_progress',
  );
  const resumeLesson = inProgressEntry
    ? MOCK_LESSONS.find((l) => l.concept_id === inProgressEntry[0])
    : undefined;
  const resumeProgress =
    resumeLesson && inProgressEntry ? inProgressEntry[1].lessonCardIndex / resumeLesson.cards.length : 0;

  const topNews = MOCK_NEWS.find((n) => !progress.readNewsIds.includes(n.id));
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

          {resumeLesson ? (
            <ResumeCard
              lessonTitle={resumeLesson.title}
              progress={resumeProgress}
              xpReward={resumeLesson.xp_reward}
              onContinue={() => router.push(`/lesson/${resumeLesson.slug}`)}
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

          {!progress.dailyChallengeCompleted ? (
            <DailyChallengeCard
              lessonTitle={MOCK_DAILY_CHALLENGE.lesson_title}
              xpReward={MOCK_DAILY_CHALLENGE.xp_reward}
              onStart={() => router.push(`/lesson/${MOCK_DAILY_CHALLENGE.lesson_slug}?challenge=1`)}
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
