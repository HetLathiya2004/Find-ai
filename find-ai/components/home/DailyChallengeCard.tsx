import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/spacing';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Tag } from '@/components/ui/Tag';
import { type ColorPalette, useColors } from '@/theme';

interface DailyChallengeCardProps {
  lessonTitle: string;
  xpReward: number;
  onStart: () => void;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
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
      backgroundColor: colors.surface2,
      borderRadius: Spacing.radius.full,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
  });
}

export function DailyChallengeCard({ lessonTitle, xpReward, onStart }: DailyChallengeCardProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Card>
      <Tag>Daily challenge</Tag>
      <View style={styles.titleRow}>
        <AppText size="base" weight="medium" style={styles.title}>
          {lessonTitle}
        </AppText>
        <View style={styles.xpPill}>
          <AppText size="xs" weight="medium" color={colors.accent}>
            +{xpReward} XP
          </AppText>
        </View>
      </View>
      <PrimaryButton title="Start challenge" onPress={onStart} />
    </Card>
  );
}
