import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Tag } from '@/components/ui/Tag';

interface DailyChallengeCardProps {
  lessonTitle: string;
  xpReward: number;
  onStart: () => void;
}

export function DailyChallengeCard({ lessonTitle, xpReward, onStart }: DailyChallengeCardProps) {
  return (
    <Card>
      <Tag>Daily challenge</Tag>
      <View style={styles.titleRow}>
        <AppText size="base" weight="medium" style={styles.title}>
          {lessonTitle}
        </AppText>
        <View style={styles.xpPill}>
          <AppText size="xs" weight="medium" color={Colors.accent}>
            +{xpReward} XP
          </AppText>
        </View>
      </View>
      <PrimaryButton title="Start challenge" onPress={onStart} />
    </Card>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.gap.lg,
    gap: Spacing.gap.sm,
  },
  title: {
    flex: 1,
  },
  xpPill: {
    backgroundColor: Colors.surface2,
    borderRadius: Spacing.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
