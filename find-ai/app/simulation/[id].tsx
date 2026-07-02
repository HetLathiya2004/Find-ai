import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExitModal } from '@/components/lesson/ExitModal';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tag } from '@/components/ui/Tag';
import { XPReward } from '@/components/ui/XPReward';
import { Colors } from '@/constants/colors';
import { getConceptById, getSimulationById } from '@/constants/mock-data';
import { Spacing } from '@/constants/spacing';
import { useHaptics } from '@/hooks/useHaptics';
import { useMockProgress } from '@/hooks/useMockProgress';

const OUTCOME_META = {
  strategic: { label: 'Strategic', color: Colors.accent },
  balanced: { label: 'Balanced', color: Colors.warning },
  risky: { label: 'Risky', color: Colors.danger },
} as const;

export default function SimulationPlayerScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const { id } = useLocalSearchParams<{ id: string }>();
  const simulation = getSimulationById(id ?? '');
  const concept = simulation ? getConceptById(simulation.concept_id) : undefined;
  const progress = useMockProgress();

  const [choiceIndex, setChoiceIndex] = useState<number | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  if (!simulation) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <AppText size="base" color={Colors.textSecondary}>
            Simulation not found.
          </AppText>
          <PrimaryButton title="Go back" onPress={() => router.back()} style={{ marginTop: 20 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (showReward) {
    return (
      <XPReward xp={simulation.xp_reward} subtitle="Simulation complete" onContinue={() => router.back()} />
    );
  }

  const answered = choiceIndex !== null;
  const chosen = answered ? simulation.choices[choiceIndex] : null;

  const selectChoice = (index: number) => {
    if (answered) return;
    haptics.medium();
    setChoiceIndex(index);
  };

  const finish = () => {
    progress.completeSimulation(simulation.concept_id, simulation.xp_reward);
    haptics.success();
    setShowReward(true);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable
          hitSlop={12}
          onPress={() => {
            haptics.light();
            if (answered) router.back();
            else setShowExitModal(true);
          }}
        >
          <Feather name="x" size={24} color={Colors.textSecondary} />
        </Pressable>
        <View style={styles.topBarSpacer} />
        <AppText size="xs" weight="medium" color={Colors.accent}>
          +{simulation.xp_reward} XP
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Tag>{concept ? `Simulation — ${concept.title}` : 'Simulation'}</Tag>
        <AppText size="2xl" weight="medium" style={styles.title}>
          {simulation.title}
        </AppText>
        <View style={styles.scenarioBox}>
          <AppText size="base" color={Colors.textSecondary} leading="relaxed">
            {simulation.scenario}
          </AppText>
        </View>

        <View style={styles.choices}>
          {simulation.choices.map((choice, i) => {
            const isChosen = choiceIndex === i;
            const meta = OUTCOME_META[choice.outcome];
            return (
              <Pressable
                key={i}
                disabled={answered}
                style={[
                  styles.choice,
                  {
                    borderColor: isChosen ? meta.color : Colors.borderDefault,
                    borderWidth: isChosen ? 2 : 1,
                    opacity: answered && !isChosen ? 0.5 : 1,
                  },
                ]}
                onPress={() => selectChoice(i)}
              >
                <AppText size="question" leading="normal">
                  {choice.text}
                </AppText>
                {answered ? (
                  <Animated.View entering={FadeIn.duration(250)} style={styles.distribution}>
                    <ProgressBar
                      progress={simulation.learner_distribution[i] / 100}
                      height={4}
                      color={isChosen ? meta.color : Colors.borderStrong}
                    />
                    <AppText size="xs" color={Colors.textMuted} style={styles.distributionLabel}>
                      {simulation.learner_distribution[i]}% of learners chose this
                    </AppText>
                  </Animated.View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {answered && chosen ? (
          <Animated.View entering={FadeIn.duration(250).delay(150)} style={styles.feedbackBox}>
            <AppText size="caption" label color={OUTCOME_META[chosen.outcome].color}>
              {OUTCOME_META[chosen.outcome].label}
            </AppText>
            <AppText size="sm" color={Colors.textSecondary} leading="normal" style={styles.feedbackText}>
              {chosen.feedback}
            </AppText>
          </Animated.View>
        ) : null}
      </ScrollView>

      {answered ? (
        <View style={styles.bottom}>
          <PrimaryButton title="Complete simulation" onPress={finish} />
        </View>
      ) : null}

      <ExitModal
        visible={showExitModal}
        onExit={() => {
          setShowExitModal(false);
          router.back();
        }}
        onKeepLearning={() => setShowExitModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.padding.cardLg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.padding.screen,
    paddingVertical: Spacing.gap.md,
  },
  topBarSpacer: {
    flex: 1,
  },
  content: {
    padding: Spacing.padding.screen,
    paddingBottom: Spacing.gap['2xl'],
  },
  title: {
    marginBottom: Spacing.gap.lg,
  },
  scenarioBox: {
    backgroundColor: Colors.surface1,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderRadius: Spacing.radius.xl,
    padding: Spacing.padding.card,
    marginBottom: Spacing.gap['2xl'],
  },
  choices: {
    gap: Spacing.gap.md,
  },
  choice: {
    backgroundColor: Colors.surface2,
    borderRadius: Spacing.radius.card,
    padding: 16,
  },
  distribution: {
    marginTop: Spacing.gap.md,
  },
  distributionLabel: {
    marginTop: 6,
  },
  feedbackBox: {
    marginTop: Spacing.gap.xl,
    backgroundColor: Colors.surface1,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderRadius: Spacing.radius.card,
    padding: 16,
  },
  feedbackText: {
    marginTop: 6,
  },
  bottom: {
    padding: Spacing.padding.screen,
    paddingBottom: 24,
  },
});
