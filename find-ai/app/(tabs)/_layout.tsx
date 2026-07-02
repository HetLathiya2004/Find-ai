import { Tabs } from 'expo-router';
import { BookOpen, Dumbbell, Home, Newspaper, User } from 'lucide-react-native';
import React from 'react';
import { Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useHaptics } from '@/hooks/useHaptics';

const ICON_SIZE = 24;

export default function TabLayout() {
  const haptics = useHaptics();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.textPrimary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          height: Spacing.tabBarHeight + (Platform.OS === 'ios' ? 0 : insets.bottom),
          backgroundColor: Colors.bg,
          borderTopWidth: 1,
          borderTopColor: Colors.borderDefault,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 8,
        },
        tabBarLabel: ({ focused, color, children }) => (
          <Text
            style={{
              fontSize: Typography.size.caption,
              fontFamily: focused ? Typography.fontFamily.medium : Typography.fontFamily.regular,
              color,
            }}
          >
            {children}
          </Text>
        ),
        sceneStyle: { backgroundColor: Colors.bg },
      }}
      screenListeners={{
        tabPress: () => haptics.light(),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color }) => <BookOpen size={ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color }) => <Dumbbell size={ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color }) => <Newspaper size={ICON_SIZE} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={ICON_SIZE} color={color} />,
        }}
      />
    </Tabs>
  );
}
