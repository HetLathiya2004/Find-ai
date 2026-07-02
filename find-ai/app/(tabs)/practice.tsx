import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ScreenSkeleton } from '@/components/ui/SkeletonLoader';
import { Tag } from '@/components/ui/Tag';
import { Colors } from '@/constants/colors';
import {
  MOCK_CONCEPTS,
  MOCK_SIMULATIONS,
  getConceptById,
  getQuizByConceptId,
} from '@/constants/mock-data';
import { Spacing } from '@/constants/spacing';
import { masteryLabel } from '@/lib/gamification';
import { useHaptics } from '@/hooks/useHaptics';
import { useMockLoading } from '@/hooks/useMockLoading';

const REVIEW_XP = 15;

export default function PracticeScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const loading = useMockLoading();

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScreenSkeleton rows={3} />
      </SafeAreaView>
    );
  }

  // Due for review: concepts at mastery 2-4 (learned but not mastered)
  const dueForReview = MOCK_CONCEPTS.filter((c) => c.mastery_level >= 2 && c.mastery_level <= 4);
  // Weak concepts: started but low mastery
  const weakConcepts = MOCK_CONCEPTS.filter((c) => c.mastery_level === 1);
  const simulations = MOCK_SIMULATIONS.slice(0, 4);

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
            {dueForReview.map((concept, i) => {
              const quiz = getQuizByConceptId(concept.id);
              return (
                <Pressable
                  key={concept.id}
                  style={[styles.row, i > 0 && styles.divider]}
                  onPress={() => {
                    haptics.light();
                    if (quiz) router.push(`/quiz/${quiz.id}`);
                  }}
                >
                  <AppText size="base" style={styles.rowTitle}>
                    {concept.title}
                  </AppText>
                  <AppText size="xs" color={Colors.accent}>
                    Review — +{REVIEW_XP} XP
                  </AppText>
                  <ChevronRight size={16} color={Colors.textMuted} />
                </Pressable>
              );
            })}
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
                  {masteryLabel(concept.mastery_level)} — Level {concept.mastery_level}
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
        <Card padding="none" style={styles.sectionCard}>
          {simulations.map((sim, i) => {
            const concept = getConceptById(sim.concept_id);
            return (
              <Pressable
                key={sim.id}
                style={[styles.simRow, i > 0 && styles.divider]}
                onPress={() => {
                  haptics.light();
                  router.push(`/simulation/${sim.id}`);
                }}
              >
                <View style={styles.simInfo}>
                  <AppText size="base" style={styles.simTitle}>
                    {sim.title}
                  </AppText>
                  {concept ? <Chip>{concept.title}</Chip> : null}
                </View>
                <AppText size="xs" color={Colors.accent}>
                  +{sim.xp_reward} XP
                </AppText>
              </Pressable>
            );
          })}
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
