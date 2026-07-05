import React from 'react';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import type { BadgeId } from '@/lib/badges';

interface BadgeIconProps {
  id: BadgeId;
  size?: number;
  color: string;
}

/**
 * Custom stroke-style SVG icons for badges — same visual language as the
 * Feather icons used across the app (24 viewBox, 2px round strokes), so the
 * badge grid sits naturally in the dark theme instead of emoji.
 */
export function BadgeIcon({ id, size = 30, color }: BadgeIconProps) {
  const strokeProps = {
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  switch (id) {
    case 'first-lesson': // open book
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" {...strokeProps} />
          <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" {...strokeProps} />
        </Svg>
      );
    case 'quiz-ace': // lightning bolt
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" {...strokeProps} />
        </Svg>
      );
    case 'simulation-pro': // game controller
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M7 8h10a5 5 0 0 1 5 5v1a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5v-1a5 5 0 0 1 5-5z"
            {...strokeProps}
          />
          <Path d="M8.5 11.5v4M6.5 13.5h4" {...strokeProps} />
          <Circle cx={16} cy={12.6} r={1.1} fill={color} />
          <Circle cx={18.4} cy={15} r={1.1} fill={color} />
        </Svg>
      );
    case 'week-warrior': // flame
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M12 2c.6 4.2-5 6.2-5 11a5 5 0 0 0 10 0c0-2.2-1-4-2.4-5.8-.5 1.6-1.4 2.4-2.6 3C12.6 8 11 5.5 12 2z"
            {...strokeProps}
          />
        </Svg>
      );
    case 'knowledge-seeker': // layered stack
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 2 2 7l10 5 10-5-10-5z" {...strokeProps} />
          <Polyline points="2,12 12,17 22,12" {...strokeProps} />
          <Polyline points="2,17 12,22 22,17" {...strokeProps} />
        </Svg>
      );
    case 'market-maven': // trending chart
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polyline points="23,6 13.5,15.5 8.5,10.5 1,18" {...strokeProps} />
          <Polyline points="17,6 23,6 23,12" {...strokeProps} />
        </Svg>
      );
  }
}
