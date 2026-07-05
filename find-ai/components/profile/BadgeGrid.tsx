import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import type { Badge } from '@/lib/badges';
import { AppText } from '@/components/ui/AppText';
import { BadgeIcon } from '@/components/profile/BadgeIcon';

interface BadgeGridProps {
  badges: Badge[];
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
              borderColor: badge.earned ? Colors.accentMuted : Colors.borderDefault,
              opacity: badge.earned ? 1 : 0.4,
            },
          ]}
        >
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: badge.earned ? Colors.accentMuted : Colors.surface2 },
            ]}
          >
            <BadgeIcon
              id={badge.id}
              size={26}
              color={badge.earned ? Colors.accent : Colors.textMuted}
            />
          </View>
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
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Spacing.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 2,
  },
});
