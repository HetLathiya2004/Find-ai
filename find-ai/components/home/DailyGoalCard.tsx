import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/CircularProgress';

interface DailyGoalCardProps {
  completed: number;
  target: number;
  loading?: boolean;
}

export function DailyGoalCard({ completed, target, loading }: DailyGoalCardProps) {
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
  const remaining = Math.max(target - completed, 0);
  return (
    <Card padding="large">
      <View style={styles.row}>
        <CircularProgress progress={target > 0 ? completed / target : 0} />
        <View style={styles.info}>
          <AppText size="sm" label color={Colors.textMuted}>
            Daily Goal
          </AppText>
          <AppText size="2xl" weight="medium" style={styles.count}>
            {completed} of {target}
          </AppText>
          <AppText size="sm" color={Colors.textSecondary}>
            {remaining === 0 ? 'Goal complete! 🎉' : `${remaining} more to go`}
          </AppText>
        </View>
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
});
