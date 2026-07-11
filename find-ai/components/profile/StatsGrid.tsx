import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/spacing';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { useColors } from '@/theme';

interface StatsGridProps {
  stats: { label: string; value: string | number }[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  const colors = useColors();

  return (
    <View style={styles.grid}>
      {stats.map((stat) => (
        <Card key={stat.label} variant="strong" style={styles.cell} padding="none">
          <AppText size="2xl" weight="medium" center>
            {String(stat.value)}
          </AppText>
          <AppText size="caption" label color={colors.textMuted} center style={styles.label}>
            {stat.label}
          </AppText>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: Spacing.gap.md,
  },
  cell: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  label: {
    marginTop: 4,
  },
});
