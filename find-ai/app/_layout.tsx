import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import 'react-native-reanimated';

import { Colors } from '@/constants/colors';
import { MockAuthProvider } from '@/hooks/useMockAuth';
import { MockProgressProvider } from '@/hooks/useMockProgress';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before fonts are ready.
SplashScreen.preventAutoHideAsync();

const FindAiTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.bg,
    card: Colors.bg,
    border: Colors.borderDefault,
    text: Colors.textPrimary,
    primary: Colors.accent,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <MockAuthProvider>
        <MockProgressProvider>
          <ThemeProvider value={FindAiTheme}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.bg },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="lesson/[slug]" options={{ presentation: 'fullScreenModal' }} />
              <Stack.Screen name="quiz/[id]" options={{ presentation: 'fullScreenModal' }} />
              <Stack.Screen name="simulation/[id]" options={{ presentation: 'fullScreenModal' }} />
              <Stack.Screen name="streak" options={{ presentation: 'modal' }} />
              <Stack.Screen name="league" />
            </Stack>
          </ThemeProvider>
        </MockProgressProvider>
      </MockAuthProvider>
    </GestureHandlerRootView>
  );
}
