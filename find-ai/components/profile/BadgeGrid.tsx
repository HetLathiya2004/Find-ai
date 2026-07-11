import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/spacing';
import type { Badge } from '@/lib/badges';
import { AppText } from '@/components/ui/AppText';
import { BadgeIcon } from '@/components/profile/BadgeIcon';
import { type ColorPalette, useColors } from '@/theme';

interface BadgeGridProps {
  badges: Badge[];
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.gap.md,
      alignItems: 'stretch',
    },
    badge: {
      flexBasis: '30%',
      flexGrow: 1,
      // Grow with label height instead of forcing a square (multi-line names).
      minHeight: 112,
      backgroundColor: colors.surface1,
      borderWidth: 1,
      borderRadius: Spacing.radius.card,
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: Spacing.gap.sm,
      paddingHorizontal: Spacing.gap.sm,
      paddingTop: Spacing.gap.md,
      paddingBottom: Spacing.gap.md,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: Spacing.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: {
      paddingHorizontal: 2,
      lineHeight: 16,
    },
  });
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.grid}>
      {badges.map((badge) => (
        <View
          key={badge.id}
          style={[
            styles.badge,
            {
              borderColor: badge.earned ? colors.accentMuted : colors.borderDefault,
              opacity: badge.earned ? 1 : 0.4,
            },
          ]}
        >
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: badge.earned ? colors.accentMuted : colors.surface2 },
            ]}
          >
            <BadgeIcon
              id={badge.id}
              size={26}
              color={badge.earned ? colors.accent : colors.textMuted}
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
