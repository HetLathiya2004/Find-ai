import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';

interface SegmentBarProps {
  total: number;
  /** Number of fully completed segments */
  completed: number;
  color?: string;
  style?: ViewStyle;
}

export function SegmentBar({ total, completed, color = Colors.accent, style }: SegmentBarProps) {
  return (
    <View style={[styles.row, style]}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            { backgroundColor: i < completed ? color : Colors.borderDefault },
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
    height: 4,
    borderRadius: Spacing.radius.full,
  },
});
