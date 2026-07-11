import { Redirect } from 'expo-router';
import { LoadingScene } from '@/components/ui/LoadingScene';
import { useAuth } from '@/hooks/useAuth';

/** Entry redirect: route to auth or the main app based on the Supabase session. */
export default function Index() {
  const { isAuthenticated, onboarded, loading } = useAuth();

  // Wait for the persisted session to restore before deciding where to go.
  if (loading) {
    return <LoadingScene />;
  }
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (!onboarded) {
    return <Redirect href="/(auth)/onboarding" />;
  }
  return <Redirect href="/(tabs)/home" />;
}
