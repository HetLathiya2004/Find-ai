import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '@/constants/spacing';
import { AppText } from './AppText';
import { Mascot } from './Mascot';
import { PrimaryButton } from './PrimaryButton';
import { type ColorPalette, useColors } from '@/theme';

const DEFAULT_MESSAGE =
  "We couldn't load the content. Please check your connection and try again.";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.padding.cardLg,
    },
    heading: {
      marginTop: Spacing.gap.lg,
    },
    message: {
      marginTop: Spacing.gap.sm,
    },
    button: {
      marginTop: Spacing.gap['2xl'],
      alignSelf: 'stretch',
    },
  });
}

/** Full-screen API failure state with a retry action. No mock fallback. */
export function ErrorState({ message = DEFAULT_MESSAGE, onRetry }: ErrorStateProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.center}>
        <Mascot pose="think" size={132} animate="bounce" />
        <AppText size="xl" weight="medium" center style={styles.heading}>
          Oops! Something went wrong
        </AppText>
        <AppText
          size="sm"
          color={colors.textSecondary}
          center
          leading="normal"
          style={styles.message}
        >
          {message}
        </AppText>
        <PrimaryButton title="Try Again" onPress={onRetry} style={styles.button} />
      </View>
    </SafeAreaView>
  );
}
