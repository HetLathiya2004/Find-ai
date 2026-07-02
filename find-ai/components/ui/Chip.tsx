import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { AppText } from './AppText';

interface ChipProps {
  children: string;
  /** Text + border tint */
  color?: string;
  /** Muted background tint (defaults to surface2) */
  backgroundColor?: string;
  style?: ViewStyle;
}

/** Small rounded status/category chip, e.g. concept names, "In Progress", "Passed — 85%" */
export function Chip({
  children,
  color = Colors.textSecondary,
  backgroundColor = Colors.surface2,
  style,
}: ChipProps) {
  return (
    <View style={[styles.chip, { backgroundColor }, style]}>
      <AppText size="xs" color={color}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: Spacing.radius.tag,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
});
