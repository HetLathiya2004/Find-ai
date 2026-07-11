import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { AppText } from './AppText';
import { Mascot } from './Mascot';
import { PrimaryButton } from './PrimaryButton';

const DEFAULT_MESSAGE =
  "We couldn't load the content. Please check your connection and try again.";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

/** Full-screen API failure state with a retry action. No mock fallback. */
export function ErrorState({ message = DEFAULT_MESSAGE, onRetry }: ErrorStateProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.center}>
        <Mascot pose="thinking" size={132} animate="entrance" />
        <AppText size="xl" weight="medium" center style={styles.heading}>
          Oops! Something went wrong
        </AppText>
        <AppText
          size="sm"
          color={Colors.textSecondary}
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
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
