import { Tabs } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useHaptics } from '@/hooks/useHaptics';
import { type ColorPalette, useColors } from '@/theme';

const ICON_SIZE = 22;

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    iconSlot: {
      width: 56,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconShell: {
      width: 56,
      height: 32,
      borderRadius: Spacing.radius.button,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconShellActive: {
      backgroundColor: colors.accent + '22',
    },
  });
}

function TabBarIcon({
  focused,
  styles,
  children,
}: {
  focused: boolean;
  styles: ReturnType<typeof createStyles>;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.iconSlot}>
      <View style={[styles.iconShell, focused && styles.iconShellActive]}>{children}</View>
    </View>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const haptics = useHaptics();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: Spacing.tabBarHeight + (Platform.OS === 'ios' ? 0 : insets.bottom),
          backgroundColor: colors.surface1,
          borderTopWidth: 2,
          borderTopColor: colors.borderDefault,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 0 : Math.max(insets.bottom, 6),
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          marginTop: 2,
          marginBottom: 4,
          textAlign: 'center',
        },
        tabBarLabel: ({ focused, color, children }) => (
          <Text
            numberOfLines={1}
            style={{
              fontSize: Typography.size.caption,
              fontFamily: focused ? Typography.fontFamily.bold : Typography.fontFamily.medium,
              color,
              textAlign: 'center',
              width: '100%',
            }}
          >
            {String(children).toUpperCase()}
          </Text>
        ),
        sceneStyle: { backgroundColor: colors.bg },
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
            <TabBarIcon focused={focused} styles={styles}>
              <Feather name="home" size={ICON_SIZE} color={color} />
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon focused={focused} styles={styles}>
              <Feather name="book-open" size={ICON_SIZE} color={color} />
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon focused={focused} styles={styles}>
              <MaterialCommunityIcons name="dumbbell" size={ICON_SIZE} color={color} />
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon focused={focused} styles={styles}>
              <Feather name="file-text" size={ICON_SIZE} color={color} />
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon focused={focused} styles={styles}>
              <Feather name="user" size={ICON_SIZE} color={color} />
            </TabBarIcon>
          ),
        }}
      />
    </Tabs>
  );
}
