import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Spacing } from '@/constants/spacing';
import { AppText } from './AppText';
import { useColors } from '@/theme';

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
  color,
  backgroundColor,
  style,
}: ChipProps) {
  const colors = useColors();
  return (
    <View style={[styles.chip, { backgroundColor: backgroundColor ?? colors.accent + '22' }, style]}>
      <AppText size="xs" weight="medium" color={color ?? colors.accentGlow}>
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
