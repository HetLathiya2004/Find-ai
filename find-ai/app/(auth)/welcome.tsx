import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { AppText } from '@/components/ui/AppText';
import { GhostButton } from '@/components/ui/GhostButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.inner}>
        <View style={styles.top}>
          <AppText size="caption" label color={Colors.textMuted} center style={styles.brand}>
            Find.ai
          </AppText>
          <AppText center weight="medium" style={styles.hero}>
            Learn finance.
          </AppText>
          <AppText center weight="medium" style={styles.hero}>
            In 5 minutes
          </AppText>
          <AppText center weight="medium" style={styles.hero}>
            a day.
          </AppText>
          <AppText size="base" color={Colors.textSecondary} center style={styles.subtitle}>
            Master markets, investing, and economics with bite-sized lessons
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
    justifyContent: 'flex-end',
  },
  brand: {
    marginBottom: Spacing.gap.md,
  },
  hero: {
    fontSize: 40,
    lineHeight: 40 * Typography.lineHeight.tight,
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: Spacing.gap.md,
    maxWidth: 300,
    alignSelf: 'center',
  },
  bottom: {
    paddingTop: Spacing.gap['2xl'] * 2,
    paddingBottom: 48,
  },
  ghost: {
    marginTop: Spacing.gap.md,
  },
});
