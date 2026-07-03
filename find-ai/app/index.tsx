import { Redirect } from 'expo-router';
import { useMockAuth } from '@/hooks/useMockAuth';

/** Entry redirect: route to auth or the main app based on mock auth state. */
export default function Index() {
  const { isAuthenticated, onboarded } = useMockAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (!onboarded) {
    return <Redirect href="/(auth)/onboarding" />;
  }
  return <Redirect href="/(tabs)/home" />;
}
