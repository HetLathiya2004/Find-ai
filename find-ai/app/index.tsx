import { Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Mascot } from '@/components/ui/Mascot';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

/** Entry redirect: route to auth or the main app based on the Supabase session. */
export default function Index() {
  const { isAuthenticated, onboarded, loading } = useAuth();

  // Wait for the persisted session to restore before deciding where to go.
  if (loading) {
    return (
      <View style={styles.loading}>
        <Mascot pose="thinking" size={120} animate="bounce" />
      </View>
    );
  }
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (!onboarded) {
    return <Redirect href="/(auth)/onboarding" />;
  }
  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
});
