import React from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import { AppText } from './AppText';
import { useColors } from '@/theme';

interface TagProps {
  children: string;
  color?: string;
  style?: TextStyle;
}

/** Uppercase section label, e.g. "DAILY CHALLENGE" */
export function Tag({ children, color, style }: TagProps) {
  const colors = useColors();
  return (
    <AppText size="caption" weight="bold" label color={color ?? colors.accent} style={StyleSheet.flatten([styles.tag, style])}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  tag: {
    marginBottom: 8,
  },
});
