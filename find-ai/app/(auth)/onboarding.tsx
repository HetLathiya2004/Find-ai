import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { AppText } from '@/components/ui/AppText';
import { FormInput } from '@/components/ui/FormInput';
import { Mascot } from '@/components/ui/Mascot';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SegmentBar } from '@/components/ui/SegmentBar';
import { useHaptics } from '@/hooks/useHaptics';
import { useAuth, AuthState } from '@/hooks/useAuth';

const TOTAL_STEPS = 3;

const GOALS: { id: AuthState['goal']; emoji: string; title: string; subtitle: string }[] = [
  { id: 'grow_wealth', emoji: '📈', title: 'Grow my wealth', subtitle: 'Learn to invest with confidence' },
  { id: 'understand_news', emoji: '📰', title: 'Understand the news', subtitle: 'Decode headlines and market moves' },
  { id: 'learn_basics', emoji: '🎓', title: 'Learn the basics', subtitle: 'Build a foundation from scratch' },
];

const MINUTES: AuthState['dailyGoalMinutes'][] = [5, 10, 15];

export default function OnboardingScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  const { completeOnboarding } = useAuth();

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<AuthState['goal'] | null>(null);
  const [minutes, setMinutes] = useState<AuthState['dailyGoalMinutes'] | null>(null);
  const [name, setName] = useState('');

  const advance = () => {
    haptics.medium();
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding({
        goal: goal ?? 'grow_wealth',
        dailyGoalMinutes: minutes ?? 10,
        displayName: name.trim(),
      });
      router.replace('/(tabs)/home');
    }
  };

  const canContinue = step === 0 ? goal !== null : step === 1 ? minutes !== null : name.trim().length > 0;

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inner}>
          <View style={styles.progressRow}>
            <SegmentBar total={TOTAL_STEPS} completed={step + 1} />
            <AppText size="xs" color={Colors.textMuted} style={styles.stepLabel}>
              {step + 1} / {TOTAL_STEPS}
            </AppText>
          </View>

          <View style={styles.content}>
            <Mascot
              pose={step === 0 ? 'think' : step === 1 ? 'wave' : 'cheer'}
              size={110}
              animate={step === 2 ? 'pop' : 'bounce'}
              style={styles.mascot}
            />
            {step === 0 ? (
              <Animated.View entering={FadeIn.duration(250)}>
                <AppText size="2xl" weight="medium">
                  What's your goal?
                </AppText>
                <View style={styles.goalList}>
                  {GOALS.map((g) => {
                    const selected = goal === g.id;
                    return (
                      <Pressable
                        key={g.id}
                        style={[styles.goalCard, { borderColor: selected ? Colors.textPrimary : Colors.borderDefault }]}
                        onPress={() => {
                          haptics.light();
                          setGoal(g.id);
                        }}
                      >
                        <AppText style={styles.goalEmoji}>{g.emoji}</AppText>
                        <View style={styles.goalInfo}>
                          <AppText size="base" weight="medium">
                            {g.title}
                          </AppText>
                          <AppText size="sm" color={Colors.textSecondary} style={styles.goalSubtitle}>
                            {g.subtitle}
                          </AppText>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </Animated.View>
            ) : step === 1 ? (
              <Animated.View entering={FadeIn.duration(250)}>
                <AppText size="2xl" weight="medium">
                  How much time per day?
                </AppText>
                <AppText size="sm" color={Colors.textSecondary} style={styles.subtitle}>
                  Even 5 minutes a day builds real knowledge
                </AppText>
                <View style={styles.timeRow}>
                  {MINUTES.map((m) => {
                    const selected = minutes === m;
                    return (
                      <Pressable
                        key={m}
                        style={[
                          styles.timeButton,
                          { borderColor: selected ? Colors.accent : Colors.borderDefault },
                        ]}
                        onPress={() => {
                          haptics.light();
                          setMinutes(m);
                        }}
                      >
                        <AppText size="base" weight="medium" color={selected ? Colors.accent : Colors.textPrimary}>
                          {m} min
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
                <AppText size="xs" color={Colors.textMuted} center style={styles.motivation}>
                  Most learners choose 10 minutes
                </AppText>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeIn.duration(250)}>
                <AppText size="2xl" weight="medium">
                  What should we call you?
                </AppText>
                <FormInput
                  placeholder="Your name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  style={styles.nameInput}
                />
              </Animated.View>
            )}
          </View>

          <View style={styles.bottom}>
            <PrimaryButton
              title={step === TOTAL_STEPS - 1 ? 'Build my plan' : 'Continue'}
              onPress={advance}
              disabled={!canContinue}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.padding.cardLg,
    paddingTop: Spacing.gap.lg,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepLabel: {
    marginLeft: Spacing.gap.md,
  },
  content: {
    flex: 1,
    marginTop: 32,
  },
  mascot: {
    alignSelf: 'center',
    marginBottom: Spacing.gap.sm,
  },
  subtitle: {
    marginTop: 6,
  },
  goalList: {
    marginTop: Spacing.gap['2xl'],
    gap: Spacing.gap.md,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap.lg,
    backgroundColor: Colors.surface1,
    borderWidth: 1,
    borderRadius: Spacing.radius.card,
    padding: Spacing.padding.card,
  },
  goalEmoji: {
    fontSize: 32,
  },
  goalInfo: {
    flex: 1,
  },
  goalSubtitle: {
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.gap.md,
    marginTop: Spacing.gap['2xl'],
  },
  timeButton: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.surface1,
    borderWidth: 1,
    borderRadius: Spacing.radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motivation: {
    marginTop: Spacing.gap.lg,
  },
  nameInput: {
    marginTop: Spacing.gap['2xl'],
  },
  bottom: {
    paddingBottom: 48,
  },
});
