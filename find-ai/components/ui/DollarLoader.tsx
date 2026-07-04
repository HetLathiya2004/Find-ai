import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';
import { Colors } from '@/constants/colors';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Feather "dollar-sign" geometry on a 24x24 viewBox.
const STEM = { x1: 12, y1: 1, x2: 12, y2: 23 };
const CURVES = 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6';
const VIEWBOX = 24;
const FILL_DURATION_MS = 1500;

interface DollarLoaderProps {
  size?: number;
  style?: ViewStyle;
}

/**
 * Branded loading indicator: a dollar sign that fills bottom-to-top with
 * emerald green (straight horizontal boundary), empties back down, and loops.
 */
export function DollarLoader({ size = 80, style }: DollarLoaderProps) {
  // 0 = empty, 1 = fully filled.
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withRepeat(
      withTiming(1, { duration: FILL_DURATION_MS, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [fill]);

  // Clip rect anchored to the bottom of the viewBox, growing upward.
  const clipProps = useAnimatedProps(() => ({
    y: VIEWBOX * (1 - fill.value),
    height: VIEWBOX * fill.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
        <Defs>
          <ClipPath id="dollar-fill-clip">
            <AnimatedRect x={0} width={VIEWBOX} animatedProps={clipProps} />
          </ClipPath>
        </Defs>
        {/* Unfilled outline */}
        <G
          stroke={Colors.textMuted}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <Line x1={STEM.x1} y1={STEM.y1} x2={STEM.x2} y2={STEM.y2} />
          <Path d={CURVES} />
        </G>
        {/* Filled portion, revealed bottom-to-top by the animated clip rect */}
        <G
          clipPath="url(#dollar-fill-clip)"
          stroke={Colors.accent}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <Line x1={STEM.x1} y1={STEM.y1} x2={STEM.x2} y2={STEM.y2} />
          <Path d={CURVES} />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
