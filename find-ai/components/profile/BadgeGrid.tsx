import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import type { MockBadge } from '@/constants/mock-data';
import { AppText } from '@/components/ui/AppText';

interface BadgeGridProps {
  badges: MockBadge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <View style={styles.grid}>
      {badges.map((badge) => (
        <View
          key={badge.id}
          style={[
            styles.badge,
            {
              borderColor: badge.earned ? Colors.borderStrong : Colors.borderDefault,
              opacity: badge.earned ? 1 : 0.3,
            },
          ]}
        >
          <AppText size="3xl" center>
            {badge.icon}
          </AppText>
          <AppText size="xs" center style={styles.name}>
            {badge.name}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.gap.md,
  },
  badge: {
    // 3 columns: (100% - 2 gaps) / 3
    flexBasis: '30%',
    flexGrow: 1,
    aspectRatio: 1,
    backgroundColor: Colors.surface1,
    borderWidth: 1,
    borderRadius: Spacing.radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.gap.sm,
    padding: Spacing.gap.sm,
  },
  name: {
    marginTop: 2,
  },
});
