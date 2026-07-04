import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BadgeGrid } from '@/components/profile/BadgeGrid';
import { MasteryList } from '@/components/profile/MasteryList';
import { StatsGrid } from '@/components/profile/StatsGrid';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/ui/FormInput';
import { DollarLoader } from '@/components/ui/DollarLoader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tag } from '@/components/ui/Tag';
import { Colors } from '@/constants/colors';
import { MOCK_BADGES, MOCK_CONCEPTS } from '@/constants/mock-data';
import { Spacing } from '@/constants/spacing';
import { formatXP, levelForXP, xpForNextLevel } from '@/lib/gamification';
import { useHaptics } from '@/hooks/useHaptics';
import { useAuth } from '@/hooks/useAuth';
import { useMockLoading } from '@/hooks/useMockLoading';
import { useProgress } from '@/hooks/useProgress';

const GOAL_LABELS: Record<string, string> = {
  grow_wealth: 'Growing my wealth',
  understand_news: 'Understanding the news',
  learn_basics: 'Learning the basics',
};

export default function ProfileScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const loading = useMockLoading();
  const { displayName, goal, dailyGoalMinutes, updateDisplayName, cycleDailyGoal, signOut } =
    useAuth();
  const { xp, streakCount } = useProgress();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(displayName);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.loader}>
          <DollarLoader />
        </View>
      </SafeAreaView>
    );
  }

  const level = levelForXP(xp);
  const levelInfo = xpForNextLevel(xp);
  const masteredConcepts = [...MOCK_CONCEPTS].sort((a, b) => b.mastery_level - a.mastery_level);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <AppText size="2xl" weight="medium" color="#000000">
              {displayName.charAt(0).toUpperCase()}
            </AppText>
          </View>
          <AppText size="xl" weight="medium" style={styles.name}>
            {displayName}
          </AppText>
          <AppText size="sm" color={Colors.textSecondary}>
            {GOAL_LABELS[goal] ?? goal}
          </AppText>
        </View>

        {/* Stats */}
        <StatsGrid
          stats={[
            { label: 'XP', value: formatXP(xp) },
            { label: 'Level', value: level },
            { label: 'Streak', value: streakCount },
          ]}
        />

        {/* Level progress */}
        <Card style={styles.levelCard}>
          <AppText size="base" weight="medium">
            Level {level}
          </AppText>
          <ProgressBar progress={levelInfo.progress} height={4} style={styles.levelBar} />
          <AppText size="xs" color={Colors.textSecondary}>
            {levelInfo.toNext} XP to Level {level + 1}
          </AppText>
        </Card>

        {/* Badges */}
        <Tag style={styles.sectionTag}>Badges</Tag>
        <BadgeGrid badges={MOCK_BADGES} />

        {/* Mastery */}
        <Tag style={styles.sectionTag}>Concept mastery</Tag>
        <MasteryList concepts={masteredConcepts.slice(0, 6)} />

        {/* Settings */}
        <Tag style={styles.sectionTag}>Settings</Tag>
        <Card padding="none">
          {/* Display name */}
          <View style={styles.settingRow}>
            <AppText size="sm" color={Colors.textSecondary}>
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

          {/* Daily goal */}
          <Pressable
            style={[styles.settingRow, styles.settingDivider]}
            onPress={() => {
              haptics.light();
              cycleDailyGoal();
            }}
          >
            <AppText size="sm" color={Colors.textSecondary}>
              Daily goal
            </AppText>
            <AppText size="base">{dailyGoalMinutes} min/day</AppText>
          </Pressable>

          {/* Sign out */}
          <Pressable
            style={[styles.settingRow, styles.settingDivider]}
            onPress={() => {
              haptics.warning();
              signOut();
              router.replace('/(auth)/welcome');
            }}
          >
            <AppText size="base" color={Colors.danger}>
              Sign out
            </AppText>
          </Pressable>
        </Card>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.gap['2xl'],
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.textPrimary,
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
    borderTopColor: Colors.borderDefault,
  },
  nameInput: {
    flex: 1,
    maxWidth: 200,
    height: 40,
  },
});
