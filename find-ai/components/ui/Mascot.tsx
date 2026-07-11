import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { Colors } from '@/constants/colors';

export type MascotPose = 'idle' | 'celebrate' | 'encourage' | 'sad' | 'thinking';

interface MascotProps {
  pose?: MascotPose;
  size?: number;
  animate?: 'none' | 'entrance' | 'bounce';
  style?: ViewStyle;
}

const LABELS: Record<MascotPose, string> = {
  idle: 'Fin, your finance learning coach',
  celebrate: 'Fin celebrating your progress',
  encourage: 'Fin cheering you on',
  sad: 'Fin encouraging you after a setback',
  thinking: 'Fin thinking through the next step',
};

/**
 * Fin is Find.ai's mascot: a warm emerald coach with a coin-shaped body.
 * The vector is kept in code so every pose remains crisp without adding an
 * SVG transformer to the Expo build.
 */
export function Mascot({
  pose = 'idle',
  size = 128,
  animate = 'none',
  style,
}: MascotProps) {
  const entrance = useSharedValue(animate === 'entrance' ? 0 : 1);
  const bob = useSharedValue(0);

  useEffect(() => {
    if (animate === 'entrance') {
      entrance.value = withDelay(80, withSpring(1, { damping: 12, stiffness: 130 }));
    }
    if (animate === 'bounce') {
      bob.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      );
    }
  }, [animate, bob, entrance]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [
      { translateY: (1 - entrance.value) * 20 - bob.value * 5 },
      { scale: 0.78 + entrance.value * 0.22 + bob.value * 0.02 },
    ],
  }));

  const happy = pose === 'celebrate' || pose === 'encourage';
  const eyeY = pose === 'sad' ? 60 : 58;

  return (
    <Animated.View
      accessible
      accessibilityRole="image"
      accessibilityLabel={LABELS[pose]}
      style={[styles.shell, { width: size, height: size }, animatedStyle, style]}
    >
      <Svg width={size} height={size} viewBox="0 0 160 160">
        <Defs>
          <LinearGradient id="fin-body" x1="20%" y1="10%" x2="80%" y2="90%">
            <Stop offset="0%" stopColor={Colors.accentGlow} />
            <Stop offset="56%" stopColor={Colors.accent} />
            <Stop offset="100%" stopColor="#07835F" />
          </LinearGradient>
          <LinearGradient id="fin-belly" x1="30%" y1="15%" x2="70%" y2="90%">
            <Stop offset="0%" stopColor="#F2FFF9" />
            <Stop offset="100%" stopColor={Colors.accentSoft} />
          </LinearGradient>
        </Defs>

        {pose === 'celebrate' ? (
          <G fill={Colors.warm}>
            <Path d="M18 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
            <Path d="M137 19l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" />
            <Circle cx="25" cy="76" r="3" />
            <Circle cx="140" cy="69" r="3" />
          </G>
        ) : null}

        {pose === 'thinking' ? (
          <G fill={Colors.accentSoft} stroke={Colors.borderStrong} strokeWidth="2">
            <Circle cx="131" cy="28" r="13" />
            <Circle cx="117" cy="43" r="5" />
            <Circle cx="108" cy="52" r="2.5" />
          </G>
        ) : null}

        <Ellipse cx="80" cy="146" rx="42" ry="7" fill="#000000" opacity="0.2" />

        <Path
          d={
            pose === 'celebrate'
              ? 'M43 98C23 83 19 61 27 56c8-5 14 16 31 22'
              : pose === 'encourage'
                ? 'M43 101C27 96 17 83 20 75c4-8 14 7 31 9'
                : 'M43 100C27 101 20 109 24 116c5 7 15-1 27-5'
          }
          fill="none"
          stroke="#07835F"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <Path
          d={
            pose === 'celebrate'
              ? 'M117 98c20-15 24-37 16-42-8-5-14 16-31 22'
              : pose === 'thinking'
                ? 'M116 101c15-7 18-21 11-25-7-4-10 8-20 13'
                : 'M117 100c16 1 23 9 19 16-5 7-15-1-27-5'
          }
          fill="none"
          stroke="#07835F"
          strokeWidth="13"
          strokeLinecap="round"
        />

        <Path
          d="M80 19c33 0 55 25 55 61 0 42-22 65-55 65S25 122 25 80c0-36 22-61 55-61z"
          fill="url(#fin-body)"
          stroke="#065F46"
          strokeWidth="3"
        />
        <Path
          d="M55 30c8-9 17-14 25-14s17 5 25 14c-7-2-14-1-19 3l-6 5-6-5c-5-4-12-5-19-3z"
          fill={Colors.warm}
          stroke="#9A6A22"
          strokeWidth="2"
        />
        <Ellipse cx="80" cy="103" rx="33" ry="29" fill="url(#fin-belly)" opacity="0.95" />

        <G>
          <Ellipse cx="59" cy={eyeY} rx="13" ry="15" fill="#F7FBF8" />
          <Ellipse cx="101" cy={eyeY} rx="13" ry="15" fill="#F7FBF8" />
          {happy ? (
            <>
              <Path d="M52 59c4-5 10-5 14 0" fill="none" stroke={Colors.inkOnAccent} strokeWidth="4" strokeLinecap="round" />
              <Path d="M94 59c4-5 10-5 14 0" fill="none" stroke={Colors.inkOnAccent} strokeWidth="4" strokeLinecap="round" />
            </>
          ) : (
            <>
              <Circle cx={pose === 'thinking' ? 62 : 59} cy={eyeY + 1} r="5" fill={Colors.inkOnAccent} />
              <Circle cx={pose === 'thinking' ? 104 : 101} cy={eyeY + 1} r="5" fill={Colors.inkOnAccent} />
              <Circle cx={pose === 'thinking' ? 64 : 61} cy={eyeY - 1} r="1.5" fill="#FFFFFF" />
              <Circle cx={pose === 'thinking' ? 106 : 103} cy={eyeY - 1} r="1.5" fill="#FFFFFF" />
            </>
          )}
        </G>

        {pose === 'sad' ? (
          <>
            <Path d="M69 82c7-6 15-6 22 0" fill="none" stroke={Colors.inkOnAccent} strokeWidth="4" strokeLinecap="round" />
            <Path d="M108 70c6 7 5 13 0 16-5-3-6-9 0-16z" fill="#8DDDF5" />
          </>
        ) : pose === 'thinking' ? (
          <Path d="M72 80h16" fill="none" stroke={Colors.inkOnAccent} strokeWidth="4" strokeLinecap="round" />
        ) : (
          <Path d="M67 78c8 10 18 10 26 0" fill="none" stroke={Colors.inkOnAccent} strokeWidth="4" strokeLinecap="round" />
        )}

        <G transform="translate(80 106)">
          <Circle cx="0" cy="0" r="15" fill={Colors.warm} stroke="#9A6A22" strokeWidth="2" />
          <Path d="M0-9v18M6-6H-3a4 4 0 000 8h6a4 4 0 010 8H-7" fill="none" stroke="#5A3B12" strokeWidth="2.8" strokeLinecap="round" />
        </G>

        <Rect x="48" y="137" width="24" height="9" rx="4.5" fill="#065F46" />
        <Rect x="88" y="137" width="24" height="9" rx="4.5" fill="#065F46" />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
