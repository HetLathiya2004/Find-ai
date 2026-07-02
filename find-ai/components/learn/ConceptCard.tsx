import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import type { MockConcept } from '@/constants/mock-data';
import { domainColor, domainLabel, masteryLabel } from '@/lib/gamification';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface ConceptCardProps {
  concept: MockConcept;
  masteryLevel: number;
  onPress: () => void;
}

export function ConceptCard({ concept, masteryLevel, onPress }: ConceptCardProps) {
  const color = domainColor(concept.domain);
  return (
    <Card onPress={onPress} style={{ borderLeftWidth: 3, borderLeftColor: color }}>
      <AppText size="caption" label color={color} style={styles.domain}>
        {domainLabel(concept.domain)}
      </AppText>
      <AppText size="base" weight="medium" style={styles.title}>
        {concept.title}
      </AppText>
      <ProgressBar progress={masteryLevel / 5} height={4} style={styles.bar} />
      <AppText size="xs" color={Colors.textSecondary}>
        Level {masteryLevel} — {masteryLabel(masteryLevel)}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  domain: {
    marginBottom: 6,
  },
  title: {
    marginBottom: Spacing.gap.md,
  },
  bar: {
    marginBottom: Spacing.gap.sm,
  },
});
