import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppFonts, Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[theme].tabIconSelected,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#1A1A2E' : '#FFFFFF',
          borderTopColor: theme === 'dark' ? '#2A2A3E' : '#E5E5E5',
        },
        tabBarInactiveTintColor: Colors[theme].tabIconDefault,
        tabBarLabelStyle: { fontFamily: AppFonts.bodyMedium },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="worksheets"
        options={{
          title: 'Worksheets',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Resources',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="arrow.down.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
