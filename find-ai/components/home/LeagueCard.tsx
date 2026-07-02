import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';

interface LeagueCardProps {
  tier: string;
  rank: number;
  totalUsers: number;
  daysUntilReset: number;
  onPress: () => void;
}

export function LeagueCard({ tier, rank, totalUsers, daysUntilReset, onPress }: LeagueCardProps) {
  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <View>
          <AppText size="base" weight="medium">
            🏆 {tier} League
          </AppText>
          <AppText size="xs" color={Colors.textMuted} style={styles.subtitle}>
            Resets in {daysUntilReset}d
          </AppText>
        </View>
        <View style={styles.rankBlock}>
          <AppText size="3xl" weight="medium">
            #{rank}
          </AppText>
          <AppText size="sm" color={Colors.textSecondary}>
            of {totalUsers}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 4,
  },
  rankBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
});
