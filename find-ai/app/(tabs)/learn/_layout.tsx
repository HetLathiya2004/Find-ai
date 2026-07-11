import { Stack } from 'expo-router';
import { useColors } from '@/theme';

export default function LearnLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
