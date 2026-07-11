import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Spacing } from '@/constants/spacing';
import { AppText } from './AppText';
import { Mascot } from './Mascot';
import { type ColorPalette, useColors } from '@/theme';

const CAPTIONS = [
  'Warming up Buck…',
  'Loading your lesson…',
  'Sharpening those horns…',
  'Crunching the numbers…',
  'Polishing the charts…',
  'Buck is thinking hard…',
];

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    fullscreen: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.padding.cardLg,
      backgroundColor: colors.bg,
    },
    inline: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.gap.xl,
    },
    stage: {
      width: '100%',
      maxWidth: 320,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mascotWrap: {
      width: 200,
      height: 200,
      alignItems: 'center',
      justifyContent: 'center',
    },
    halo: {
      position: 'absolute',
      borderRadius: Spacing.radius.full,
      backgroundColor: colors.accent,
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
      top: 18,
      right: 18,
      height: 32,
      minWidth: 56,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      borderRadius: Spacing.radius.button,
      borderWidth: 2,
      borderColor: colors.borderDefault,
      backgroundColor: colors.surface1,
    },
    caption: {
      marginTop: Spacing.gap.lg,
      width: '100%',
      textAlign: 'center',
    },
    progressDots: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      width: '100%',
      gap: Spacing.gap.sm,
      marginTop: Spacing.gap.md,
    },
    dot: {
      backgroundColor: colors.accent,
    },
  });
}

function WaveDot({
  delay,
  size = 9,
  dotStyle,
}: {
  delay: number;
  size?: number;
  dotStyle: { backgroundColor: string };
}) {
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
      style={[dotStyle, { width: size, height: size, borderRadius: size / 2 }, animatedStyle]}
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
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [captionIndex, setCaptionIndex] = useState(0);
  const mascotSize = fullscreen ? 148 : 112;

  useEffect(() => {
    const timer = setInterval(() => {
      setCaptionIndex((index) => (index + 1) % CAPTIONS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[fullscreen ? styles.fullscreen : styles.inline, style]}>
      <View style={styles.stage}>
        <View style={styles.mascotWrap}>
          <View style={[styles.halo, styles.haloLarge]} />
          <View style={[styles.halo, styles.haloSmall]} />
          <Mascot pose="think" size={mascotSize} animate="bounce" />
          <View style={styles.thoughtBubble}>
            <WaveDot delay={0} size={6} dotStyle={styles.dot} />
            <WaveDot delay={150} size={6} dotStyle={styles.dot} />
            <WaveDot delay={300} size={6} dotStyle={styles.dot} />
          </View>
        </View>
        <AppText
          key={captionIndex}
          size="xs"
          weight="bold"
          label
          color={colors.textSecondary}
          center
          style={styles.caption}
        >
          {CAPTIONS[captionIndex]}
        </AppText>
        <View style={styles.progressDots}>
          <WaveDot delay={0} dotStyle={styles.dot} />
          <WaveDot delay={150} dotStyle={styles.dot} />
          <WaveDot delay={300} dotStyle={styles.dot} />
          <WaveDot delay={450} dotStyle={styles.dot} />
        </View>
      </View>
    </View>
  );
}
