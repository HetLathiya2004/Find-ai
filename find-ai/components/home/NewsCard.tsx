import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Tag } from '@/components/ui/Tag';

interface NewsCardProps {
  headline: string;
  conceptTitle: string;
  xpReward: number;
  onPress: () => void;
}

export function NewsCard({ headline, conceptTitle, xpReward, onPress }: NewsCardProps) {
  return (
    <Card onPress={onPress}>
      <Tag>From today's news</Tag>
      <AppText size="base" weight="medium" style={styles.title}>
        {headline}
      </AppText>
      <View style={styles.bottomRow}>
        <Chip>{conceptTitle}</Chip>
        <AppText size="xs" color={Colors.accent}>
          Learn this → +{xpReward} XP
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing.gap.md,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
