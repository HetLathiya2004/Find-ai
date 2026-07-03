import React from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { AppText } from './AppText';

interface TagProps {
  children: string;
  color?: string;
  style?: TextStyle;
}

/** Uppercase section label, e.g. "DAILY CHALLENGE" */
export function Tag({ children, color = Colors.textMuted, style }: TagProps) {
  return (
    <AppText size="caption" label color={color} style={StyleSheet.flatten([styles.tag, style])}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  tag: {
    marginBottom: 8,
  },
});
