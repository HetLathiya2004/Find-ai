import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import type { MockLessonCard } from '@/constants/mock-data';
import { AppText } from '@/components/ui/AppText';

interface LessonCardProps {
  card: MockLessonCard;
}

/** Large centered content card inside the lesson player. */
export function LessonCard({ card }: LessonCardProps) {
  return (
    <Animated.View key={card.title} entering={FadeIn.duration(250)} style={styles.card}>
      <AppText size="2xl" weight="medium" style={styles.title}>
        {card.title}
      </AppText>
      <AppText size="base" color={Colors.textSecondary} leading="relaxed">
        {card.body}
      </AppText>
      {card.visual_hint ? (
        <View style={styles.hintBox}>
          <AppText size="sm" color={Colors.textSecondary} style={styles.hintText}>
            {card.visual_hint}
          </AppText>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface1,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderRadius: Spacing.radius.xl,
    padding: Spacing.padding.cardLg,
  },
  title: {
    marginBottom: Spacing.gap.lg,
  },
  hintBox: {
    marginTop: Spacing.gap.xl,
    backgroundColor: Colors.surface2,
    borderRadius: Spacing.radius.button,
    padding: 16,
  },
  hintText: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    lineHeight: 22,
  },
});
