import React from 'react';
import { StyleSheet, Switch, View, ViewStyle } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Spacing } from '@/constants/spacing';
import { useHaptics } from '@/hooks/useHaptics';
import { useColors, useTheme } from '@/theme';

interface ThemeSettingRowProps {
  style?: ViewStyle | ViewStyle[];
}

/** Profile settings toggle for light ↔ dark (locks off System). */
export function ThemeSettingRow({ style }: ThemeSettingRowProps) {
  const colors = useColors();
  const { isDark, setPreference } = useTheme();
  const haptics = useHaptics();

  return (
    <View style={[styles.row, style]}>
      <AppText size="sm" color={colors.textSecondary}>
        Theme
      </AppText>
      <Switch
        accessibilityLabel="Dark theme"
        value={isDark}
        onValueChange={(nextDark) => {
          haptics.light();
          setPreference(nextDark ? 'dark' : 'light');
        }}
        trackColor={{
          false: colors.borderStrong,
          true: colors.accent,
        }}
        thumbColor={colors.surfaceRaised}
        ios_backgroundColor={colors.borderStrong}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.padding.card,
    paddingVertical: 12,
    gap: Spacing.gap.md,
    minHeight: 52,
  },
});
