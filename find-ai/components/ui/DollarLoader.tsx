import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { Colors } from '@/constants/colors';

// Feather "dollar-sign" geometry on a 24x24 viewBox, placed on the coin face.
const STEM = { x1: 12, y1: 1, x2: 12, y2: 23 };
const CURVES = 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6';

const SPIN_DURATION_MS = 1800;

interface DollarLoaderProps {
  size?: number;
  style?: ViewStyle;
}

/** Four-point sparkle that twinkles on its own delayed loop. */
function Sparkle({
  delay,
  size,
  position,
}: {
  delay: number;
  size: number;
  position: { top?: number; bottom?: number; left?: number; right?: number };
}) {
  const twinkle = useSharedValue(0);

  useEffect(() => {
    twinkle.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      ),
    );
  }, [twinkle, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: twinkle.value * 0.9,
    transform: [
      { scale: 0.4 + twinkle.value * 0.6 },
      { rotate: `${twinkle.value * 90}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.sparkle, position, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
          fill="#6EE7B7"
        />
      </Svg>
    </Animated.View>
  );
}

/**
 * Branded loading indicator: an emerald coin that flips like a game pickup —
 * 3D spin, gentle bob, glowing ground reflection, and twinkling sparkles.
 */
export function DollarLoader({ size = 80, style }: DollarLoaderProps) {
  // One full cycle: 0 -> 1, looping linearly; all motion derives from it.
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: SPIN_DURATION_MS, easing: Easing.linear }),
      -1,
      false,
    );
  }, [t]);

  const coinStyle = useAnimatedStyle(() => {
    const phase = t.value * 2 * Math.PI;
    // |cos| makes the coin appear to spin edge-on without mirroring the glyph.
    const flip = Math.max(Math.abs(Math.cos(phase)), 0.1);
    return {
      transform: [{ translateY: Math.sin(phase) * -(size * 0.06) }, { scaleX: flip }],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    const phase = t.value * 2 * Math.PI;
    return {
      opacity: 0.25 + ((Math.sin(phase) + 1) / 2) * 0.2,
      transform: [{ scale: 1 + ((Math.sin(phase) + 1) / 2) * 0.08 }],
    };
  });

  const reflectionStyle = useAnimatedStyle(() => {
    const phase = t.value * 2 * Math.PI;
    const lift = (Math.sin(phase) + 1) / 2; // 0 grounded, 1 highest
    return {
      opacity: 0.35 - lift * 0.2,
      transform: [{ scaleX: 1 - lift * 0.3 }],
    };
  });

  return (
    <View style={[styles.container, { width: size * 1.4, height: size * 1.4 }, style]}>
      {/* Ambient glow behind the coin */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, glowStyle]}>
        <Svg width={size * 1.4} height={size * 1.4} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="loader-glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={Colors.accent} stopOpacity={0.5} />
              <Stop offset="100%" stopColor={Colors.accent} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={50} cy={50} r={48} fill="url(#loader-glow)" />
        </Svg>
      </Animated.View>

      {/* The coin */}
      <Animated.View style={coinStyle}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="loader-coin" cx="38%" cy="32%" r="75%">
              <Stop offset="0%" stopColor="#6EE7B7" />
              <Stop offset="55%" stopColor={Colors.accent} />
              <Stop offset="100%" stopColor="#047857" />
            </RadialGradient>
          </Defs>
          {/* Face + rim */}
          <Circle cx={50} cy={50} r={44} fill="url(#loader-coin)" stroke="#065F46" strokeWidth={2.5} />
          <Circle
            cx={50}
            cy={50}
            r={36}
            fill="none"
            stroke="#D1FAE5"
            strokeOpacity={0.45}
            strokeWidth={1.5}
            strokeDasharray="3 5"
            strokeLinecap="round"
          />
          {/* Shine sweep on the upper left */}
          <Path
            d="M18 36 A 36 36 0 0 1 40 15"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity={0.55}
            strokeWidth={4}
            strokeLinecap="round"
          />
          {/* Dollar glyph, embossed */}
          <G transform="translate(28.4 28.4) scale(1.8)">
            <G
              stroke="#064E3B"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <Line x1={STEM.x1} y1={STEM.y1} x2={STEM.x2} y2={STEM.y2} />
              <Path d={CURVES} />
            </G>
            <G
              stroke="#ECFDF5"
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <Line x1={STEM.x1} y1={STEM.y1} x2={STEM.x2} y2={STEM.y2} />
              <Path d={CURVES} />
            </G>
          </G>
        </Svg>
      </Animated.View>

      {/* Ground reflection */}
      <Animated.View
        style={[
          styles.reflection,
          {
            width: size * 0.55,
            height: size * 0.09,
            borderRadius: size,
            backgroundColor: Colors.accent,
          },
          reflectionStyle,
        ]}
      />

      {/* Sparkles */}
      <Sparkle delay={0} size={size * 0.16} position={{ top: size * 0.06, right: size * 0.16 }} />
      <Sparkle delay={450} size={size * 0.11} position={{ top: size * 0.34, left: size * 0.04 }} />
      <Sparkle delay={900} size={size * 0.13} position={{ bottom: size * 0.3, right: size * 0.02 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reflection: {
    position: 'absolute',
    bottom: 0,
  },
  sparkle: {
    position: 'absolute',
  },
});
