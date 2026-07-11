import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/spacing';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tag } from '@/components/ui/Tag';
import { type ColorPalette, useColors } from '@/theme';

interface ResumeCardProps {
  lessonTitle: string;
  /** 0 to 1 */
  progress: number;
  xpReward: number;
  onContinue: () => void;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    title: {
      marginBottom: Spacing.gap.md,
    },
    bar: {
      marginBottom: Spacing.gap.sm,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.gap.lg,
    },
    xpPill: {
      backgroundColor: colors.surface2,
      borderRadius: Spacing.radius.full,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
  });
}

export function ResumeCard({ lessonTitle, progress, xpReward, onContinue }: ResumeCardProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Card>
      <Tag>Resume where you left off</Tag>
      <AppText size="lg" weight="medium" style={styles.title}>
        {lessonTitle}
      </AppText>
      <ProgressBar progress={progress} style={styles.bar} />
      <View style={styles.metaRow}>
        <AppText size="xs" color={colors.textSecondary}>
          {Math.round(progress * 100)}% complete
        </AppText>
        <View style={styles.xpPill}>
          <AppText size="xs" weight="medium" color={colors.accent}>
            +{xpReward} XP
          </AppText>
        </View>
      </View>
      <PrimaryButton title="Continue" onPress={onContinue} />
    </Card>
  );
}
