import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Mascot } from '@/components/ui/Mascot';

interface DailyGoalCardProps {
  completed: number;
  target: number;
  xpEarned?: number;
  loading?: boolean;
}

/** Any activity counts toward the goal — these are the suggested ways in,
 * shown as a checklist so the goal is concrete instead of just a number. */
const GOAL_IDEAS: { icon: keyof typeof Feather.glyphMap; label: string }[] = [
  { icon: 'book-open', label: 'Crush a lesson' },
  { icon: 'zap', label: 'Ace a quiz' },
  { icon: 'play-circle', label: 'Run a simulation' },
  { icon: 'repeat', label: 'Review a concept' },
  { icon: 'trending-up', label: 'Stack one more' },
];

const MAX_ROWS = 5;

export function DailyGoalCard({ completed, target, xpEarned = 0, loading }: DailyGoalCardProps) {
  if (loading) {
    return (
      <Card padding="large">
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={Colors.accent} />
          <AppText size="sm" color={Colors.textMuted}>Loading daily goal...</AppText>
        </View>
      </Card>
    );
  }

  const done = completed >= target && target > 0;
  const rows = Math.min(Math.max(target, 1), MAX_ROWS);

  return (
    <Card padding="large">
      <View style={styles.row}>
        {done ? (
          <Mascot pose="cheer" size={72} animate="pop" />
        ) : (
          <CircularProgress
            progress={target > 0 ? completed / target : 0}
            size={64}
            strokeWidth={5}
            label={`${Math.min(completed, target)}/${target}`}
          />
        )}
        <View style={styles.info}>
          <AppText size="sm" label color={Colors.textMuted}>
            Daily Goal
          </AppText>
          <AppText size="lg" weight="medium" style={styles.count}>
            {done ? 'Goal smashed! 🎉' : `${target - completed} to go today`}
          </AppText>
          <AppText size="sm" color={xpEarned > 0 ? Colors.accent : Colors.textSecondary}>
            {xpEarned > 0 ? `+${xpEarned} XP earned today` : 'Any activity counts'}
          </AppText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.checklist}>
        {Array.from({ length: rows }, (_, i) => {
          const idea = GOAL_IDEAS[i % GOAL_IDEAS.length];
          const checked = i < completed;
          return (
            <View key={i} style={styles.checkRow}>
              <Feather
                name={checked ? 'check-circle' : 'circle'}
                size={18}
                color={checked ? Colors.accent : Colors.textMuted}
              />
              <Feather
                name={idea.icon}
                size={14}
                color={checked ? Colors.textSecondary : Colors.textMuted}
              />
              <AppText
                size="sm"
                color={checked ? Colors.textSecondary : Colors.textMuted}
                style={checked ? styles.checkedLabel : undefined}
              >
                {idea.label}
              </AppText>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap.xl,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap.md,
    paddingVertical: Spacing.gap.md,
  },
  info: {
    flex: 1,
  },
  count: {
    marginTop: 4,
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderDefault,
    marginVertical: Spacing.gap.lg,
  },
  checklist: {
    gap: Spacing.gap.md,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap.md,
  },
  checkedLabel: {
    textDecorationLine: 'line-through',
  },
});
