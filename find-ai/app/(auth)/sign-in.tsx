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

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useMockAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length === 0) {
      setError('Please enter your password');
      return;
    }
    setError(null);
    signIn(email.trim());
    router.replace('/(tabs)/home');
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
              Welcome back
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
              autoComplete="current-password"
              style={styles.passwordInput}
            />
            {error ? (
              <AppText size="xs" color={Colors.danger} style={styles.error}>
                {error}
              </AppText>
            ) : null}
            <PrimaryButton title="Sign in" onPress={submit} style={styles.submit} />
            <Pressable onPress={() => router.replace('/(auth)/sign-up')} style={styles.toggle}>
              <AppText size="sm" color={Colors.textSecondary} center>
                Don't have an account? <AppText size="sm" color={Colors.accent}>Sign up</AppText>
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
