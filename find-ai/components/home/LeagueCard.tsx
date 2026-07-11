import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { useColors } from '@/theme';

interface LeagueCardProps {
  tier: string;
  rank: number;
  totalUsers: number;
  onPress: () => void;
}

export function LeagueCard({ tier, rank, totalUsers, onPress }: LeagueCardProps) {
  const colors = useColors();
  const ranked = rank > 0;

  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <View>
          <AppText size="base" weight="medium">
            🏆 {tier} League
          </AppText>
          <AppText size="xs" color={colors.textMuted} style={styles.subtitle}>
            xp + streak bonus
          </AppText>
        </View>
        <View style={styles.rankBlock}>
          {ranked ? (
            <>
              <AppText size="3xl" weight="medium">
                #{rank}
              </AppText>
              {totalUsers > 0 ? (
                <AppText size="sm" color={colors.textSecondary}>
                  of {totalUsers}
                </AppText>
              ) : null}
            </>
          ) : (
            <AppText size="sm" color={colors.textSecondary}>
              not ranked yet
            </AppText>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: {
    marginTop: 2,
  },
  rankBlock: {
    alignItems: 'flex-end',
  },
});
