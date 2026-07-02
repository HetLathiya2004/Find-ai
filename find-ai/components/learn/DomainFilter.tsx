import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import type { Domain } from '@/constants/mock-data';
import { domainColor, domainLabel } from '@/lib/gamification';
import { useHaptics } from '@/hooks/useHaptics';
import { AppText } from '@/components/ui/AppText';

export type DomainFilterValue = Domain | 'all';

const FILTERS: DomainFilterValue[] = ['all', 'markets', 'investing', 'macro', 'corporate_finance'];

interface DomainFilterProps {
  selected: DomainFilterValue;
  onSelect: (value: DomainFilterValue) => void;
}

export function DomainFilter({ selected, onSelect }: DomainFilterProps) {
  const haptics = useHaptics();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((filter) => {
        const isActive = filter === selected;
        const isAll = filter === 'all';
        const activeBg = isAll ? 'transparent' : domainColor(filter);
        return (
          <Pressable
            key={filter}
            style={[
              styles.pill,
              isActive
                ? isAll
                  ? styles.allActive
                  : { backgroundColor: activeBg, borderColor: activeBg }
                : styles.inactive,
            ]}
            onPress={() => {
              haptics.light();
              onSelect(filter);
            }}
          >
            <AppText
              size="sm"
              weight={isActive ? 'medium' : 'regular'}
              color={isActive ? Colors.textPrimary : Colors.textSecondary}
            >
              {isAll ? 'All' : domainLabel(filter)}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.padding.screen,
    gap: Spacing.gap.sm,
  },
  pill: {
    borderRadius: Spacing.radius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  allActive: {
    backgroundColor: 'transparent',
    borderColor: Colors.textPrimary,
  },
  inactive: {
    backgroundColor: Colors.surface1,
    borderColor: Colors.borderDefault,
  },
});
