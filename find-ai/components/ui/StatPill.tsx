import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useHaptics } from '@/hooks/useHaptics';
import { AppText } from './AppText';

interface StatPillProps {
  emoji: string;
  value: string | number;
  /** Color of the number */
  valueColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

/** Inline pill: emoji + number (e.g. streak "🔥 7" or XP "⚡ 1,450") */
export function StatPill({ emoji, value, valueColor = Colors.accent, onPress, style }: StatPillProps) {
  const haptics = useHaptics();

  const content = (
    <>
      <AppText size="sm">{emoji}</AppText>
      <AppText size="sm" weight="medium" color={valueColor}>
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

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface2,
    borderWidth: 2,
    borderColor: Colors.borderDefault,
    borderBottomWidth: 4,
    borderRadius: Spacing.radius.button,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
});
