import React, { useEffect } from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
} from 'react-native';
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

export type MascotPose = 'idle' | 'wave' | 'cheer' | 'think' | 'sad';
export type MascotAnimation = 'bounce' | 'wave' | 'pop' | 'none';

interface MascotProps {
  pose?: MascotPose;
  size?: number;
  animate?: MascotAnimation;
  style?: StyleProp<ImageStyle>;
}

const POSES: Record<MascotPose, ImageSourcePropType> = {
  idle: require('../../assets/mascot/buck-idle.png'),
  wave: require('../../assets/mascot/buck-wave.png'),
  cheer: require('../../assets/mascot/buck-cheer.png'),
  think: require('../../assets/mascot/buck-think.png'),
  sad: require('../../assets/mascot/buck-sad.png'),
};

const AnimatedImage = Animated.createAnimatedComponent(Image);

/** Buck the Bull, ported directly from the corrected Lovable reference. */
export function Mascot({
  pose = 'idle',
  size = 140,
  animate = 'bounce',
  style,
}: MascotProps) {
  const progress = useSharedValue(animate === 'pop' ? 0 : 1);
  const loop = useSharedValue(0);

  useEffect(() => {
    if (animate === 'pop') {
      progress.value = withSpring(1, { damping: 9, stiffness: 150 });
    } else {
      progress.value = withTiming(1, { duration: 1 });
    }

    if (animate === 'bounce') {
      loop.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      );
    } else if (animate === 'wave') {
      loop.value = withSequence(
        withTiming(-1, { duration: 120 }),
        withTiming(1, { duration: 180 }),
        withTiming(-0.7, { duration: 160 }),
        withTiming(0.5, { duration: 150 }),
        withTiming(0, { duration: 150 }),
        withDelay(
          200,
          withRepeat(
            withSequence(
              withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
              withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
            ),
            -1,
          ),
        ),
      );
    } else {
      loop.value = 0;
    }
  }, [animate, loop, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = animate === 'wave' && Math.abs(loop.value) > 0.75 ? loop.value * 8 : 0;
    const lift = animate === 'bounce' || animate === 'wave' ? Math.max(loop.value, 0) * -8 : 0;
    return {
      opacity: progress.value,
      transform: [
        { translateY: lift },
        { rotate: `${rotation}deg` },
        { scale: animate === 'pop' ? 0.5 + progress.value * 0.5 : 1 },
      ],
    };
  });

  return (
    <AnimatedImage
      accessible
      accessibilityRole="image"
      accessibilityLabel="Buck the Bull mascot"
      source={POSES[pose]}
      resizeMode="contain"
      style={[styles.image, { width: size, height: size }, animatedStyle, style]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    flexShrink: 0,
  },
});
