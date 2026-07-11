import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { AppText } from '@/components/ui/AppText';
import { GhostButton } from '@/components/ui/GhostButton';
import { Mascot } from '@/components/ui/Mascot';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.inner}>
        <View style={styles.top}>
          <AppText size="base" weight="bold" color={Colors.accentSoft} center style={styles.brand}>
            Find.ai
          </AppText>
          <Mascot pose="wave" size={200} animate="wave" style={styles.mascot} />
          <AppText center weight="bold" style={styles.hero}>
            Learn finance.{'\n'}5 minutes a day.
          </AppText>
          <AppText size="base" color={Colors.textSecondary} center style={styles.subtitle}>
            Bite-sized lessons for markets, investing, and economics — with Buck.
          </AppText>
        </View>
        <View style={styles.bottom}>
          <PrimaryButton title="Get started" onPress={() => router.push('/(auth)/sign-up')} />
          <GhostButton
            title="I already have an account"
            onPress={() => router.push('/(auth)/sign-in')}
            style={styles.ghost}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    paddingHorizontal: Spacing.padding.cardLg,
  },
  top: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    marginBottom: Spacing.gap.sm,
    letterSpacing: 0.3,
  },
  mascot: {
    marginBottom: Spacing.gap.sm,
  },
  hero: {
    fontSize: 36,
    lineHeight: 36 * Typography.lineHeight.tight,
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: Spacing.gap.md,
    maxWidth: 300,
    alignSelf: 'center',
  },
  bottom: {
    paddingTop: Spacing.gap.xl,
    paddingBottom: 32,
  },
  ghost: {
    marginTop: Spacing.gap.md,
  },
});
