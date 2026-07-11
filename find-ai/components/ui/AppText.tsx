import React from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

interface AppTextProps extends TextProps {
  size?: keyof typeof Typography.size;
  weight?: 'regular' | 'medium' | 'bold' | 'black';
  color?: string;
  center?: boolean;
  /** Line height multiplier key */
  leading?: keyof typeof Typography.lineHeight;
  /** Uppercase label styling with wide tracking */
  label?: boolean;
}

export function AppText({
  size = 'sm',
  weight = 'regular',
  color = Colors.textPrimary,
  center = false,
  leading,
  label = false,
  style,
  children,
  ...rest
}: AppTextProps) {
  const fontSize = Typography.size[size];
  const composed: TextStyle = {
    fontFamily: Typography.fontFamily[weight],
    fontSize,
    color,
    ...(center ? { textAlign: 'center' as const } : null),
    ...(leading ? { lineHeight: fontSize * Typography.lineHeight[leading] } : null),
    ...(label
      ? { textTransform: 'uppercase' as const, letterSpacing: Typography.tracking.wider }
      : null),
  };
  return (
    <Text style={StyleSheet.flatten([composed, style])} {...rest}>
      {children}
    </Text>
  );
}
