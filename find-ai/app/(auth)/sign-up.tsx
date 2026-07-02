import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { AppText } from '@/components/ui/AppText';
import { BackRow } from '@/components/ui/BackRow';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useMockAuth } from '@/hooks/useMockAuth';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useMockAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError(null);
    signUp(email.trim());
    router.replace('/(auth)/onboarding');
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
            <PrimaryButton title="Sign up" onPress={submit} style={styles.submit} />
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
  toggle: {
    marginTop: Spacing.gap.lg,
  },
});
