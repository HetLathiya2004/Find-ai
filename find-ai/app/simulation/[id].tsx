import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExitModal } from '@/components/lesson/ExitModal';
import { AppText } from '@/components/ui/AppText';
import { LoadingScene } from '@/components/ui/LoadingScene';
import { ErrorState } from '@/components/ui/ErrorState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tag } from '@/components/ui/Tag';
import { XPReward } from '@/components/ui/XPReward';
import { Spacing } from '@/constants/spacing';
import { useConcept } from '@/hooks/useConcept';
import { useHaptics } from '@/hooks/useHaptics';
import { useProgress } from '@/hooks/useProgress';
import { type ColorPalette, useColors } from '@/theme';

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
      backgroundColor: colors.surface1,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      borderRadius: Spacing.radius.xl,
      padding: Spacing.padding.card,
      marginBottom: Spacing.gap['2xl'],
    },
    choices: {
      gap: Spacing.gap.md,
    },
    choice: {
      backgroundColor: colors.surface2,
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
      backgroundColor: colors.surface1,
      borderWidth: 1,
      borderColor: colors.borderDefault,
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
}

export default function SimulationPlayerScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const outcomeMeta = useMemo(
    () =>
      ({
        strategic: { label: 'Strategic', color: colors.accent },
        balanced: { label: 'Balanced', color: colors.warning },
        risky: { label: 'Risky', color: colors.danger },
      }) as const,
    [colors],
  );
  // The route param is the concept slug — simulation content lives on the concept.
  const { id } = useLocalSearchParams<{ id: string }>();
  const { concept, loading, error, retry } = useConcept(id ?? null, 'choices');
  const progress = useProgress();

  const [choiceIndex, setChoiceIndex] = useState<number | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Capture whether the simulation was already completed before this session.
  const wasAlreadyCompleted = useRef(false);

  useEffect(() => {
    if (!concept) return;
    wasAlreadyCompleted.current =
      progress.getConceptProgress(concept.id).simulationStatus === 'completed';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concept?.id]);

  if (error) {
    return <ErrorState onRetry={retry} />;
  }

  if (loading || !concept) {
    return (
      <View style={styles.loader}>
        <LoadingScene fullscreen={false} />
      </View>
    );
  }

  if (showReward) {
    return (
      <XPReward
        xp={wasAlreadyCompleted.current ? 0 : concept.sim_xp}
        subtitle="Simulation complete"
        onContinue={() => router.back()}
      />
    );
  }

  const answered = choiceIndex !== null;
  const chosen = answered ? concept.choices[choiceIndex] : null;

  const selectChoice = (index: number) => {
    if (answered) return;
    haptics.medium();
    setChoiceIndex(index);
  };

  const finish = () => {
    progress.completeSimulation(concept.id, concept.sim_xp);
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
          <Feather name="x" size={24} color={colors.textSecondary} />
        </Pressable>
        <View style={styles.topBarSpacer} />
        <AppText size="xs" weight="medium" color={colors.accent}>
          +{concept.sim_xp} XP
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Tag>{`Simulation · ${concept.title}`}</Tag>
        <AppText size="2xl" weight="medium" style={styles.title}>
          {concept.sim_title}
        </AppText>
        <View style={styles.scenarioBox}>
          <AppText size="base" color={colors.textSecondary} leading="relaxed">
            {concept.sim_scenario}
          </AppText>
        </View>

        <View style={styles.choices}>
          {concept.choices.map((choice, i) => {
            const isChosen = choiceIndex === i;
            const meta = outcomeMeta[choice.outcome];
            return (
              <Pressable
                key={choice.id}
                disabled={answered}
                style={[
                  styles.choice,
                  {
                    borderColor: isChosen ? meta.color : colors.borderDefault,
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
                      progress={choice.learner_pct / 100}
                      height={4}
                      color={isChosen ? meta.color : colors.borderStrong}
                    />
                    <AppText size="xs" color={colors.textMuted} style={styles.distributionLabel}>
                      {choice.learner_pct}% of learners chose this
                    </AppText>
                  </Animated.View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {answered && chosen ? (
          <Animated.View entering={FadeIn.duration(250).delay(150)} style={styles.feedbackBox}>
            <AppText size="caption" label color={outcomeMeta[chosen.outcome].color}>
              {outcomeMeta[chosen.outcome].label}
            </AppText>
            <AppText size="sm" color={colors.textSecondary} leading="normal" style={styles.feedbackText}>
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
