import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

export function FormInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={Colors.textMuted}
      keyboardAppearance="dark"
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 54,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderRadius: Spacing.radius.button,
    paddingHorizontal: 16,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
});
