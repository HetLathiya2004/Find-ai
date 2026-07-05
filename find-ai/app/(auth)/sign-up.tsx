import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { AppText } from '@/components/ui/AppText';
import { BackRow } from '@/components/ui/BackRow';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/hooks/useAuth';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, signInWithGoogle, onboarded } = useAuth();
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
            <AppText size="sm" color={Colors.textSecondary} style={styles.subtitle}>
              Start your financial learning journey
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
              <AppText size="xs" color={Colors.danger} style={styles.error}>
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
              <Ionicons name="logo-google" size={18} color={Colors.textPrimary} />
              <AppText size="base" weight="medium" style={styles.googleLabel}>
                Continue with Google
              </AppText>
            </Pressable>
            <Pressable onPress={() => router.replace('/(auth)/sign-in')} style={styles.toggle}>
              <AppText size="sm" color={Colors.textSecondary} center>
                Already have an account? <AppText size="sm" color={Colors.accent}>Sign in</AppText>
              </AppText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
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
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    backgroundColor: Colors.surface1,
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
