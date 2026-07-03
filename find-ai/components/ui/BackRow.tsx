import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { useHaptics } from '@/hooks/useHaptics';
import { AppText } from './AppText';

interface BackRowProps {
  label?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

/** "chevron-left + back" row used on drill-down and fullscreen pages */
export function BackRow({ label = 'Back', onPress, style }: BackRowProps) {
  const router = useRouter();
  const haptics = useHaptics();

  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={12}
      style={[styles.row, style]}
      onPress={() => {
        haptics.light();
        if (onPress) onPress();
        else router.back();
      }}
    >
      <Feather name="chevron-left" size={18} color={Colors.textSecondary} />
      <AppText size="sm" color={Colors.textSecondary}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
});
