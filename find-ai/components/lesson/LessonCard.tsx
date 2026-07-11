import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Spacing } from '@/constants/spacing';
import type { MockLessonCard } from '@/constants/mock-data';
import { AppText } from '@/components/ui/AppText';
import { type ColorPalette, useColors } from '@/theme';

type AnimatedViewProps = React.ComponentProps<typeof Animated.View>;

interface LessonCardProps {
  card: MockLessonCard;
  /** Layout animations, so the lesson player can slide cards by direction. */
  entering?: AnimatedViewProps['entering'];
  exiting?: AnimatedViewProps['exiting'];
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface1,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      borderRadius: Spacing.radius.xl,
      padding: Spacing.padding.cardLg,
    },
    title: {
      marginBottom: Spacing.gap.lg,
    },
    hintBox: {
      marginTop: Spacing.gap.xl,
      backgroundColor: colors.surface2,
      borderRadius: Spacing.radius.button,
      padding: 16,
    },
    hintText: {
      fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
      lineHeight: 22,
    },
  });
}

/** Large centered content card inside the lesson player. */
export function LessonCard({ card, entering = FadeIn.duration(250), exiting }: LessonCardProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Animated.View key={card.title} entering={entering} exiting={exiting} style={styles.card}>
      <AppText size="2xl" weight="medium" style={styles.title}>
        {card.title}
      </AppText>
      <AppText size="base" color={colors.textSecondary} leading="relaxed">
        {card.body}
      </AppText>
      {card.visual_hint ? (
        <View style={styles.hintBox}>
          <AppText size="sm" color={colors.textSecondary} style={styles.hintText}>
            {card.visual_hint}
          </AppText>
        </View>
      ) : null}
    </Animated.View>
  );
}
