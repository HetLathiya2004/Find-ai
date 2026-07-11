import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Spacing } from '@/constants/spacing';
import { useHaptics } from '@/hooks/useHaptics';
import { AppText } from './AppText';
import { type ColorPalette, useColors } from '@/theme';

interface StatPillProps {
  emoji: string;
  value: string | number;
  /** Color of the number */
  valueColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surface2,
      borderWidth: 2,
      borderColor: colors.borderDefault,
      borderBottomWidth: 4,
      borderRadius: Spacing.radius.button,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
  });
}

/** Inline pill: emoji + number (e.g. streak "🔥 7" or XP "⚡ 1,450") */
export function StatPill({ emoji, value, valueColor, onPress, style }: StatPillProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const haptics = useHaptics();

  const content = (
    <>
      <AppText size="sm">{emoji}</AppText>
      <AppText size="sm" weight="medium" color={valueColor ?? colors.accent}>
        {String(value)}
      </AppText>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={[styles.pill, style]}
        onPress={() => {
          haptics.light();
          onPress();
        }}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.pill, style]}>{content}</View>;
}
