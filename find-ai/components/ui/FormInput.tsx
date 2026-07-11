import React, { useMemo } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useColors, useTheme } from '@/theme';

export function FormInput(props: TextInputProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        input: {
          height: 48,
          backgroundColor: colors.surface2,
          borderWidth: 2,
          borderColor: colors.borderDefault,
          borderRadius: Spacing.radius.button,
          paddingHorizontal: 16,
          fontSize: Typography.size.base,
          fontFamily: Typography.fontFamily.regular,
          color: colors.textPrimary,
        },
      }),
    [colors],
  );

  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      keyboardAppearance={isDark ? 'dark' : 'light'}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}
