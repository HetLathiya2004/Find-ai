import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/spacing';
import { AppText } from '@/components/ui/AppText';
import { BackRow } from '@/components/ui/BackRow';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/hooks/useAuth';
import { type ColorPalette, useColors } from '@/theme';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    flex: {
      flex: 1,
    },
    inner: {
      flex: 1,
      paddingHorizontal: Spacing.padding.cardLg,
      paddingTop: Spacing.gap.lg,
    },
    headingBlock: {
      marginTop: 32,
    },
    subtitle: {
      marginTop: 6,
    },
    form: {
      marginTop: Spacing.gap['2xl'],
    },
    passwordInput: {
      marginTop: Spacing.gap.md,
    },
    error: {
      marginTop: Spacing.gap.sm,
    },
    submit: {
      marginTop: Spacing.gap['2xl'],
    },
    googleButton: {
      marginTop: Spacing.gap.md,
      height: 52,
      borderRadius: Spacing.radius.button,
      borderWidth: 2,
      borderColor: colors.borderDefault,
      backgroundColor: colors.surface2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleDisabled: {
      opacity: 0.4,
    },
    googleLabel: {
      marginLeft: Spacing.gap.sm,
    },
    toggle: {
      marginTop: Spacing.gap.lg,
    },
  });
}

export default function SignUpScreen() {
  const router = useRouter();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError(null);
    setBusy(true);
    const message = await signUp(email.trim(), password);
    setBusy(false);
    if (message) {
      setError(message);
      return;
    }
    // Route through the index redirect, which reads the freshly-set
    // `onboarded` flag: existing users land on home, new users on onboarding.
    router.replace('/');
  };

  const submitGoogle = async () => {
    setError(null);
    setBusy(true);
    const message = await signInWithGoogle();
    setBusy(false);
    if (message) {
      setError(message);
      return;
    }
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inner}>
          <BackRow label="back" />
          <View style={styles.headingBlock}>
            <AppText size="2xl" weight="medium">
              Create your account
            </AppText>
            <AppText size="sm" color={colors.textSecondary} style={styles.subtitle}>
              Start learning in 30 seconds.
            </AppText>
          </View>
          <View style={styles.form}>
            <FormInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <FormInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              style={styles.passwordInput}
            />
            {error ? (
              <AppText size="xs" color={colors.danger} style={styles.error}>
                {error}
              </AppText>
            ) : null}
            <PrimaryButton
              title={busy ? 'Creating account…' : 'Sign up'}
              onPress={submit}
              disabled={busy}
              style={styles.submit}
            />
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={submitGoogle}
              style={[styles.googleButton, busy && styles.googleDisabled]}
            >
              <Ionicons name="logo-google" size={18} color={colors.textPrimary} />
              <AppText size="base" weight="medium" style={styles.googleLabel}>
                Continue with Google
              </AppText>
            </Pressable>
            <Pressable onPress={() => router.replace('/(auth)/sign-in')} style={styles.toggle}>
              <AppText size="sm" color={colors.textSecondary} center>
                Already have an account? <AppText size="sm" color={colors.accent}>Sign in</AppText>
              </AppText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
