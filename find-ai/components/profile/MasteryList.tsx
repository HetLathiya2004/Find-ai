import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import type { MockConcept } from '@/constants/mock-data';
import { masteryLabel } from '@/lib/gamification';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { MasteryDots } from '@/components/ui/MasteryDots';

interface MasteryListProps {
  concepts: MockConcept[];
}

export function MasteryList({ concepts }: MasteryListProps) {
  return (
    <Card padding="none">
      {concepts.map((concept, i) => (
        <View key={concept.id} style={[styles.row, i > 0 && styles.divider]}>
          <View style={styles.info}>
            <AppText size="sm">{concept.title}</AppText>
            <AppText size="xs" color={Colors.textSecondary} style={styles.label}>
              {masteryLabel(concept.mastery_level)}
            </AppText>
          </View>
          <MasteryDots level={concept.mastery_level} />
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.padding.card,
    paddingVertical: 14,
    gap: Spacing.gap.md,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderDefault,
  },
  info: {
    flex: 1,
  },
  label: {
    marginTop: 2,
  },
});
