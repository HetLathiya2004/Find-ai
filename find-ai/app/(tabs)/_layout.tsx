import { Tabs } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
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
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          height: Spacing.tabBarHeight + (Platform.OS === 'ios' ? 0 : insets.bottom),
          backgroundColor: Colors.surface1,
          borderTopWidth: 1,
          borderTopColor: Colors.borderStrong,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 8,
        },
        tabBarLabel: ({ focused, color, children }) => (
          <Text
            style={{
              fontSize: Typography.size.caption,
              fontFamily: focused ? Typography.fontFamily.bold : Typography.fontFamily.medium,
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
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconShell, focused && styles.iconShellActive]}>
              <Feather name="home" size={ICON_SIZE} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconShell, focused && styles.iconShellActive]}>
              <Feather name="book-open" size={ICON_SIZE} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconShell, focused && styles.iconShellActive]}>
              <MaterialCommunityIcons name="dumbbell" size={ICON_SIZE} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconShell, focused && styles.iconShellActive]}>
              <Feather name="file-text" size={ICON_SIZE} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconShell, focused && styles.iconShellActive]}>
              <Feather name="user" size={ICON_SIZE} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconShell: {
    width: 42,
    height: 32,
    borderRadius: Spacing.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconShellActive: {
    backgroundColor: Colors.accentMuted + '55',
  },
});
