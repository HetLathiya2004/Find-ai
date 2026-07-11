import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { AppText } from './AppText';
import { Mascot } from './Mascot';

const CAPTIONS = [
  'Warming up Buck…',
  'Loading your lesson…',
  'Sharpening those horns…',
  'Crunching the numbers…',
  'Polishing the charts…',
  'Buck is thinking hard…',
];

function WaveDot({ delay, size = 9 }: { delay: number; size?: number }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1, { duration: 400 }), withTiming(0, { duration: 800 })),
        -1,
      ),
    );
  }, [delay, t]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + t.value * 0.5,
    transform: [{ translateY: t.value * -7 }, { scale: 1 + t.value * 0.2 }],
  }));

  return (
    <Animated.View
      style={[styles.dot, { width: size, height: size, borderRadius: size / 2 }, animatedStyle]}
    />
  );
}

export function LoadingScene({
  fullscreen = true,
  style,
}: {
  fullscreen?: boolean;
  style?: ViewStyle;
}) {
  const [captionIndex, setCaptionIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCaptionIndex((index) => (index + 1) % CAPTIONS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[fullscreen ? styles.fullscreen : styles.inline, style]}>
      <View style={styles.mascotWrap}>
        <View style={[styles.halo, styles.haloLarge]} />
        <View style={[styles.halo, styles.haloSmall]} />
        <Mascot pose="think" size={fullscreen ? 160 : 112} animate="bounce" />
        <View style={styles.thoughtBubble}>
          <WaveDot delay={0} size={6} />
          <WaveDot delay={150} size={6} />
          <WaveDot delay={300} size={6} />
        </View>
      </View>
      <AppText
        key={captionIndex}
        size="xs"
        weight="bold"
        label
        color={Colors.textSecondary}
        center
        style={styles.caption}
      >
        {CAPTIONS[captionIndex]}
      </AppText>
      <View style={styles.progressDots}>
        <WaveDot delay={0} />
        <WaveDot delay={150} />
        <WaveDot delay={300} />
        <WaveDot delay={450} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.padding.cardLg,
    backgroundColor: Colors.bg,
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.gap.xl,
  },
  mascotWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    borderRadius: Spacing.radius.full,
    backgroundColor: Colors.accent,
  },
  haloLarge: {
    width: 166,
    height: 166,
    opacity: 0.08,
  },
  haloSmall: {
    width: 136,
    height: 136,
    opacity: 0.1,
  },
  thoughtBubble: {
    position: 'absolute',
    top: -4,
    right: -12,
    height: 32,
    minWidth: 56,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: Spacing.radius.button,
    borderWidth: 2,
    borderColor: Colors.borderDefault,
    backgroundColor: Colors.surface1,
  },
  caption: {
    marginTop: Spacing.gap.lg,
  },
  progressDots: {
    flexDirection: 'row',
    gap: Spacing.gap.sm,
    marginTop: Spacing.gap.lg,
  },
  dot: {
    backgroundColor: Colors.accent,
  },
});
