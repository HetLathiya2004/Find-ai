import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Spacing } from '@/constants/spacing';
import { useColors } from '@/theme';

interface SegmentBarProps {
  total: number;
  /** Number of fully completed segments */
  completed: number;
  color?: string;
  style?: ViewStyle;
}

export function SegmentBar({ total, completed, color, style }: SegmentBarProps) {
  const colors = useColors();
  const segmentColor = color ?? colors.accent;

  return (
    <View style={[styles.row, style]}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            i < completed
              ? { backgroundColor: segmentColor, borderColor: segmentColor }
              : { backgroundColor: colors.surface2, borderColor: colors.borderDefault },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.gap.xs,
    flex: 1,
  },
  segment: {
    flex: 1,
    height: 10,
    borderRadius: Spacing.radius.full,
    borderWidth: 1,
  },
});
